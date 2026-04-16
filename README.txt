SAFE CAR MODULAR PRO

FRONTEND
cd frontend
npm install
npm run dev

BACKEND
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Frontend: http://localhost:3000
Backend: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs
