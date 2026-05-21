# Ticket Queue System

A comprehensive support ticket queue management system with automatic priority adjustment based on wait time.

## Features

### Backend (Node.js + Express)
- ✅ Ticket creation and management
- ✅ Automatic priority increase based on wait time
- ✅ Queue reordering with tie-breaking by creation time
- ✅ Displacement tracking (max 3 displacements)
- ✅ RESTful API endpoints
- ✅ Queue statistics

### Customer Mobile App (React Native)
- ✅ Create support tickets (Billing or Technical)
- ✅ Real-time queue position tracking
- ✅ Live priority updates
- ✅ Displacement count monitoring
- ✅ Pull-to-refresh functionality

### Admin Web App (React)
- ✅ Real-time queue visualization
- ✅ Queue statistics dashboard
- ✅ Ticket status management
- ✅ Process and resolve tickets
- ✅ Live updates every 3 seconds

## Priority System

### How Priority Works
1. **Initial Priority**: Every ticket starts at priority 1
2. **Time-based Increase**: Priority increases by 0.1 for every minute waited
3. **Max Priority**: Capped at 100
4. **Tie-breaking**: If two tickets have equal priority, the earlier ticket (by creation time) stays ahead

### Displacement Rules
- Tickets can be pushed backward in queue **maximum 3 times**
- After reaching the limit, tickets retain their position
- Displacement count is tracked and displayed

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Admin Web App Setup
```bash
cd admin-web-app
npm install
npm start
# App runs on http://localhost:3000
```

### Customer Mobile App Setup
```bash
cd customer-mobile-app
npm install
npm start
# Follow React Native CLI instructions
```

## API Endpoints

### Tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get all tickets in queue
- `GET /api/tickets/:ticketId` - Get specific ticket
- `POST /api/tickets/:ticketId/process` - Start processing ticket
- `POST /api/tickets/:ticketId/resolve` - Resolve ticket

### Statistics
- `GET /api/stats` - Get queue statistics

## Project Structure
```
Agumentik-Task/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── models/
│   │   │   └── Ticket.js
│   │   ├── services/
│   │   │   └── TicketQueueService.js
│   │   ├── controllers/
│   │   │   └── ticketController.js
│   │   ├── routes/
│   │   │   └── tickets.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── customer-mobile-app/       # React Native mobile app
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── screens/
│   │   │   ├── CreateTicketScreen.js
│   │   │   └── QueuePositionScreen.js
│   │   └── App.js
│   ├── package.json
│   └── app.json
└── admin-web-app/             # React admin dashboard
    ├── src/
    │   ├── services/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── QueueTable.js
    │   │   ├── QueueTable.css
    │   │   ├── StatsCard.js
    │   │   └── StatsCard.css
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    └── package.json
```

## Technology Stack

- **Backend**: Node.js, Express, UUID
- **Frontend**: React, React Native
- **API**: REST with JSON
- **Styling**: CSS3, Native styling

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

## Queue Algorithm

The queue maintains order using a priority-based sorting mechanism:

1. **Sort by Priority** (descending)
2. **Tie-break by Creation Time** (ascending - earlier tickets first)
3. **Respects Displacement Limits** (max 3 times)

## Real-time Updates

- Backend updates priorities every minute
- Admin dashboard polls every 3 seconds
- Mobile app polls every 5 seconds

## Running All Services

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Admin Web App
cd admin-web-app && npm start

# Terminal 3 - Mobile App
cd customer-mobile-app && npm start
```

## License
MIT

## Support
For issues or feature requests, please create an issue in the repository.
