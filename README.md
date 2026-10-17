# VYRA-Intelligent-Disaster-Response
VYRA is an intelligent disaster-response platform designed to help emergency responders identify who needs help most during disasters such as floods, earthquakes, and heatwaves.  The platform enables people to submit emergency reports with their location, number of people affected, injuries, immediate dangers, and essential medical needs.

ResQNet/
│
├── client/                         # STAGES 2, 4, 5, 7, 8, 9
│   ├── public/
│   │   ├── icons/
│   │   ├── images/
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportForm.jsx
│   │   │   │   ├── ReportCard.jsx
│   │   │   │   ├── ReportFilters.jsx
│   │   │   │   └── PriorityBadge.jsx
│   │   │   ├── map/
│   │   │   │   ├── DisasterMap.jsx
│   │   │   │   ├── MapMarkers.jsx
│   │   │   │   └── MapLegend.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatCard.jsx
│   │   │       ├── RecentReports.jsx
│   │   │       └── ActivityFeed.jsx
│   │   │
│   │   ├── pages/                  # Application screens
│   │   │   ├── Home.jsx
│   │   │   ├── ReportEmergency.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DisasterMapPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── TriagePage.jsx
│   │   │   ├── ResourcesPage.jsx
│   │   │   ├── TeamsPage.jsx
│   │   │   ├── SheltersPage.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── AuthContext.jsx
│   │   │   │   └── authService.js
│   │   │   ├── reports/
│   │   │   │   └── reportService.js
│   │   │   ├── resources/
│   │   │   │   └── resourceService.js
│   │   │   └── dispatch/
│   │   │       └── dispatchService.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useOnlineStatus.js
│   │   │   └── useSocket.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── offline/                # STAGE 8
│   │   │   ├── db.js
│   │   │   ├── offlineQueue.js
│   │   │   ├── syncReports.js
│   │   │   └── duplicateDetection.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   ├── location.js
│   │   │   └── validators.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # STAGES 3, 4, 6, 7, 9
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── models/                 # MongoDB collections
│   │   │   ├── User.js
│   │   │   ├── EmergencyReport.js
│   │   │   ├── RescueTeam.js
│   │   │   ├── Resource.js
│   │   │   ├── Shelter.js
│   │   │   ├── Dispatch.js
│   │   │   └── AuditLog.js
│   │   │
│   │   ├── controllers/            # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── reportController.js
│   │   │   ├── triageController.js
│   │   │   ├── teamController.js
│   │   │   ├── resourceController.js
│   │   │   ├── shelterController.js
│   │   │   └── dispatchController.js
│   │   │
│   │   ├── routes/                 # REST API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── triageRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   ├── shelterRoutes.js
│   │   │   └── dispatchRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── triageEngine.js     # STAGE 6
│   │   │   ├── triageExplanation.js
│   │   │   ├── dispatchService.js
│   │   │   ├── resourceMatcher.js
│   │   │   ├── locationService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── middleware/             # STAGE 9
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── validateRequest.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── sockets/
│   │   │   └── socketHandler.js
│   │   │
│   │   ├── validators/
│   │   │   ├── reportValidator.js
│   │   │   ├── authValidator.js
│   │   │   └── dispatchValidator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── asyncHandler.js
│   │   │   └── generateToken.js
│   │   │
│   │   ├── seed/
│   │   │   ├── seed.js
│   │   │   └── sampleData.js
│   │   │
│   │   └── server.js
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── reports.test.js
│   │   ├── triage.test.js
│   │   └── dispatch.test.js
│   │
│   ├── .env.example
│   └── package.json
│
├── docs/                           # STAGES 1 AND 10
│   ├── PROJECT_PLAN.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── TRIAGE_RULES.md
│   ├── TESTING_PLAN.md
│   └── DEMO_SCENARIO.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── package.json                    # Root scripts
├── README.md
└── LICENSE

