import os, re, sqlite3, secrets
from pathlib import Path
from datetime import timedelta
from functools import wraps
from flask import Flask, jsonify, request, session, send_from_directory, g
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get('HUSH_TECH_DB', BASE_DIR / 'hush_tech.db'))
app = Flask(__name__, static_folder=None)
app.config.update(SECRET_KEY=os.environ.get('HUSH_TECH_SECRET_KEY') or secrets.token_hex(32), SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax', SESSION_COOKIE_SECURE=os.environ.get('HUSH_TECH_HTTPS','0') == '1', PERMANENT_SESSION_LIFETIME=timedelta(hours=8), MAX_CONTENT_LENGTH=16*1024)
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

def db():
    if 'db' not in g:
        g.db=sqlite3.connect(DB_PATH); g.db.row_factory=sqlite3.Row; g.db.execute('PRAGMA foreign_keys=ON')
    return g.db
@app.teardown_appcontext
def close_db(_error=None):
    conn=g.pop('db',None)
    if conn is not None: conn.close()
def init_db():
    DB_PATH.parent.mkdir(parents=True,exist_ok=True)
    with sqlite3.connect(DB_PATH) as c:
        c.execute('PRAGMA journal_mode=WAL')
        c.execute('''CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,password_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)''')
        c.execute('''CREATE TABLE IF NOT EXISTS learning_progress(id INTEGER PRIMARY KEY AUTOINCREMENT,student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,item_type TEXT NOT NULL,item_key TEXT NOT NULL,completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(student_id,item_type,item_key))''')

init_db()

def public_user(row): return {'id':row['id'],'name':row['name'],'email':row['email'],'created_at':row['created_at']}
def current_student():
    sid=session.get('student_id')
    return db().execute('SELECT id,name,email,created_at FROM students WHERE id=?',(sid,)).fetchone() if sid else None
def require_student(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        student=current_student()
        if student is None: return jsonify(error='Please sign in to continue.'),401
        return fn(student,*args,**kwargs)
    return wrapper
@app.after_request
def security_headers(response):
    response.headers.setdefault('X-Content-Type-Options','nosniff'); response.headers.setdefault('X-Frame-Options','DENY'); response.headers.setdefault('Referrer-Policy','strict-origin-when-cross-origin')
    response.headers.setdefault('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
    response.headers.setdefault('Cache-Control','no-store' if request.path.startswith('/api/') else 'no-cache')
    return response
@app.get('/')
def home(): return send_from_directory(BASE_DIR,'index.html')
@app.get('/<path:filename>')
def static_files(filename): return send_from_directory(BASE_DIR,filename)
@app.post('/api/register')
def register():
    data=request.get_json(silent=True) or {}; name=str(data.get('name','')).strip(); email=str(data.get('email','')).strip().lower(); password=data.get('password','')
    if not 2<=len(name)<=80: return jsonify(error='Name must be between 2 and 80 characters.'),400
    if len(email)>254 or not EMAIL_RE.match(email): return jsonify(error='Please provide a valid email address.'),400
    if not isinstance(password,str) or not 12<=len(password)<=128: return jsonify(error='Password must be between 12 and 128 characters.'),400
    conn=db()
    try:
        cur=conn.execute('INSERT INTO students(name,email,password_hash) VALUES(?,?,?)',(name,email,generate_password_hash(password,method='scrypt'))); conn.commit()
    except sqlite3.IntegrityError: return jsonify(error='An account with this email already exists. Please sign in.'),409
    session.clear(); session['student_id']=cur.lastrowid; session.permanent=True
    row=conn.execute('SELECT id,name,email,created_at FROM students WHERE id=?',(cur.lastrowid,)).fetchone()
    return jsonify(user=public_user(row)),201
@app.post('/api/login')
def login():
    data=request.get_json(silent=True) or {}; email=str(data.get('email','')).strip().lower(); password=data.get('password','')
    if not email or not isinstance(password,str) or not password: return jsonify(error='Enter your email address and password.'),400
    row=db().execute('SELECT * FROM students WHERE email=?',(email,)).fetchone()
    if row is None or not check_password_hash(row['password_hash'],password): return jsonify(error='Email or password is incorrect.'),401
    session.clear(); session['student_id']=row['id']; session.permanent=True
    return jsonify(user=public_user(row))
@app.get('/api/me')
def me():
    student=current_student(); return jsonify(user=public_user(student) if student else None)
@app.post('/api/logout')
def logout(): session.clear(); return jsonify(ok=True)
@app.get('/api/progress')
@require_student
def get_progress(student):
    rows=db().execute('SELECT item_type,item_key,completed,updated_at FROM learning_progress WHERE student_id=? ORDER BY item_type,item_key',(student['id'],)).fetchall()
    return jsonify(progress=[dict(r) for r in rows])
@app.post('/api/progress')
@require_student
def save_progress(student):
    data=request.get_json(silent=True) or {}; typ=str(data.get('item_type','')); key=str(data.get('item_key','')); completed=data.get('completed')
    if typ not in {'lesson','lab'} or not key or len(key)>120 or not isinstance(completed,bool): return jsonify(error='Invalid progress item.'),400
    db().execute('''INSERT INTO learning_progress(student_id,item_type,item_key,completed,updated_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(student_id,item_type,item_key) DO UPDATE SET completed=excluded.completed,updated_at=CURRENT_TIMESTAMP''',(student['id'],typ,key,int(completed))); db().commit()
    return jsonify(ok=True)
@app.get('/api/health')
def health(): return jsonify(status='ok')
if __name__=='__main__':
    init_db(); app.run(host=os.environ.get('HOST','127.0.0.1'),port=int(os.environ.get('PORT','5000')),debug=False)
