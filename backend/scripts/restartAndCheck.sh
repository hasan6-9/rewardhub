#!/bin/bash
# Quick fix script to restart backend server and verify student wallet

echo "======================================================================"
echo "Backend Server Restart & Student Wallet Check"
echo "======================================================================"
echo ""

echo "STEP 1: Check student wallet connection"
echo "----------------------------------------------------------------------"
echo "Checking student ID: 693adeac9521d0860cf9b59d"
echo ""

STUDENT_DATA=$(curl -s "http://localhost:5000/api/students/693adeac9521d0860cf9b59d")
echo "$STUDENT_DATA" | jq '.'

WALLET_CONNECTED=$(echo "$STUDENT_DATA" | jq -r '.walletConnected')
WALLET_ADDRESS=$(echo "$STUDENT_DATA" | jq -r '.walletAddress')

echo ""
echo "Wallet Connected: $WALLET_CONNECTED"
echo "Wallet Address: $WALLET_ADDRESS"
echo ""

if [ "$WALLET_CONNECTED" != "true" ] || [ "$WALLET_ADDRESS" == "null" ]; then
    echo "❌ ERROR: Student wallet is NOT connected!"
    echo ""
    echo "The student must connect their wallet before achievements can be awarded."
    echo ""
    echo "To fix this, the student needs to:"
    echo "1. Log in to the application"
    echo "2. Connect their MetaMask wallet"
    echo "3. Sign the verification message"
    echo ""
    echo "OR you can manually update the database:"
    echo ""
    echo "mongosh rewardhub --eval 'db.users.updateOne("
    echo "  {_id: ObjectId(\"693adeac9521d0860cf9b59d\")},"
    echo "  {\$set: {"
    echo "    walletConnected: true,"
    echo "    walletAddress: \"0x70997970C51812dc3A010C7d01b50e0d17dc79C8\""
    echo "  }}"
    echo ")'"
    echo ""
else
    echo "✅ Student wallet is connected: $WALLET_ADDRESS"
fi

echo ""
echo "======================================================================"
echo "STEP 2: Restart Backend Server"
echo "======================================================================"
echo ""
echo "⚠️  MANUAL ACTION REQUIRED:"
echo ""
echo "1. In the terminal running 'npm start', press Ctrl+C"
echo "2. Wait for the server to stop"
echo "3. Run: npm start"
echo "4. Wait for the message: 🚀 Server running on port 5000"
echo ""
echo "After restart, test with:"
echo "  curl -X GET \"http://localhost:5000/api/student-achievements\""
echo ""
echo "Expected: JSON response (not 'Cannot GET')"
echo ""
echo "======================================================================"
