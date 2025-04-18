@echo off
echo Starting AI Mock Interview Application...

echo.
echo Starting Flask backend...
start cmd /k "cd backend && pip install -r requirements.txt && python app.py"

echo.
echo Starting React frontend...
start cmd /k "npm start"

echo.
echo Waiting for services to start...
echo.
echo When both servers are running:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Visit http://localhost:3000 in your browser to use the application 