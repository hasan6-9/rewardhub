@echo off
REM backend/scripts/setup-testing.bat
REM Automated setup script for RewardHub testing (Windows)

echo ========================================
echo RewardHub Testing Setup Script
echo ========================================
echo.

REM Step 1: Check dependencies
echo Step 1: Checking dependencies...
echo -----------------------------------

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)
echo [OK] Node.js found
node --version

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)
echo [OK] npm found
npm --version

echo.

REM Step 2: Install npm packages
echo Step 2: Installing npm packages...
echo --------------------------------------

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install npm packages
    exit /b 1
)
echo [OK] npm packages installed

call npm install --save-dev colors axios
echo [OK] Testing dependencies installed

echo.

REM Step 3: Check for Ganache
echo Step 3: Checking Ganache...
echo ------------------------------

where ganache-cli >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Ganache CLI not found. Installing globally...
    call npm install -g ganache-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Ganache CLI
        echo Please install manually: npm install -g ganache-cli
        exit /b 1
    )
    echo [OK] Ganache CLI installed
) else (
    echo [OK] Ganache CLI found
)

echo.

REM Step 4: Setup .env file
echo Step 4: Setting up environment variables...
echo -----------------------------------------------

if not exist .env (
    echo [WARN] .env file not found. Creating from template...
    (
        echo # MongoDB
        echo MONGO_URI=mongodb://localhost:27017/rewardhub
        echo.
        echo # JWT Secret
        echo JWT_SECRET=rewardhub_jwt_secret_change_in_production_12345
        echo.
        echo # Ganache ^(Local Testing^)
        echo SEPOLIA_RPC_URL=http://127.0.0.1:8545
        echo PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
        echo.
        echo # Contract Address ^(will be set after deployment^)
        echo CONTRACT_ADDRESS=
        echo.
        echo # Server
        echo PORT=5000
        echo API_BASE_URL=http://localhost:5000
    ) > .env
    echo [OK] .env file created
) else (
    echo [INFO] .env file already exists, skipping...
)

echo.

REM Step 5: Start Ganache
echo Step 5: Starting Ganache...
echo ------------------------------

REM Check if port 8545 is in use
netstat -ano | findstr ":8545" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Ganache is already running on port 8545
) else (
    echo [INFO] Starting Ganache in background...
    
    REM Create logs directory
    if not exist logs mkdir logs
    
    REM Start Ganache (Windows doesn't have & for background, use start)
    start "Ganache" /MIN cmd /c "ganache-cli --deterministic --accounts 10 --defaultBalanceEther 1000 --port 8545 > logs\ganache.log 2>&1"
    
    REM Wait for Ganache to start
    timeout /t 5 /nobreak >nul
    
    echo [OK] Ganache started
    echo [INFO] Ganache logs: logs\ganache.log
)

echo.

REM Step 6: Compile smart contracts
echo Step 6: Compiling smart contracts...
echo ---------------------------------------

call npx hardhat clean >nul 2>nul
call npx hardhat compile

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile smart contracts
    exit /b 1
)
echo [OK] Smart contracts compiled

echo.

REM Step 7: Deploy contract
echo Step 7: Deploying contract to Ganache...
echo --------------------------------------------

call npx hardhat run scripts/deploy.js --network localhost > .deploy-output.txt 2>&1
type .deploy-output.txt

REM Extract contract address (Windows doesn't have grep/awk, use findstr)
for /f "tokens=4" %%i in ('findstr "Contract deployed at:" .deploy-output.txt') do set CONTRACT_ADDRESS=%%i

if defined CONTRACT_ADDRESS (
    echo [OK] Contract deployed at: %CONTRACT_ADDRESS%
    
    REM Update .env with contract address (Windows)
    powershell -Command "(Get-Content .env) -replace 'CONTRACT_ADDRESS=.*', 'CONTRACT_ADDRESS=%CONTRACT_ADDRESS%' | Set-Content .env"
    
    echo [OK] CONTRACT_ADDRESS updated in .env
) else (
    echo [ERROR] Failed to extract contract address
    del .deploy-output.txt
    exit /b 1
)

del .deploy-output.txt

echo.

REM Step 8: Seed test data
echo Step 8: Seeding test data...
echo -------------------------------

call node scripts/seedTestData.js

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to seed test data
    exit /b 1
)
echo [OK] Test data seeded successfully

echo.

REM Step 9: Generate admin token
echo Step 9: Generating admin JWT token...
echo ----------------------------------------

call node scripts/generateAdminToken.js admin@rewardhub.com > .token-output.txt 2>&1

REM Extract token
for /f "tokens=*" %%i in ('findstr "eyJ" .token-output.txt') do set ADMIN_TOKEN=%%i

if defined ADMIN_TOKEN (
    echo [OK] Admin token generated
    echo.
    echo [INFO] Admin JWT Token ^(save this for Postman^):
    echo %ADMIN_TOKEN%
    
    REM Save to file
    echo %ADMIN_TOKEN% > .admin-token
    echo [INFO] Token saved to: .admin-token
) else (
    echo [WARN] Could not extract admin token, but you can generate it manually
)

del .token-output.txt

echo.

REM Final summary
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Summary:
echo   - Ganache running on: http://127.0.0.1:8545
echo   - Contract deployed at: %CONTRACT_ADDRESS%
echo   - MongoDB database: rewardhub
echo   - Test users created: 14 ^(1 admin, 3 faculty, 10 students^)
echo   - Test achievements: 8
echo   - Test perks: 7
echo.
echo Test Credentials ^(password: password123^):
echo   Admin:   admin@rewardhub.com
echo   Faculty: sarah.johnson@rewardhub.com
echo   Student: alice.thompson@student.com ^(has wallet^)
echo.
echo Next Steps:
echo   1. Start backend server:  npm start
echo   2. Import Postman collection from artifacts
echo   3. Set adminToken in Postman environment
echo   4. Run test suite:  node scripts/testAllEndpoints.js
echo.
echo For detailed testing guide, see: COMPLETE_TESTING_GUIDE.md
echo.
echo To stop Ganache: Close the Ganache window
echo.

pause