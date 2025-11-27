#!/bin/bash
cd /home/kavia/workspace/code-generation/travel-planner-47086-47096/travel_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

