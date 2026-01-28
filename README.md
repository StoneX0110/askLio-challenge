# askLio Procurement Challenge

A modern procurement request application that uses AI to extract data from PDF invoices and manage procurement workflows.

## Getting Started

The easiest way to run the entire application (frontend, backend, and database) is using **Docker Compose**.

### Prerequisite
Ensure you have an `.env` file in the root directory with your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

### Running with Docker
Run the following command in the root directory:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite, OpenAI GPT-5.2 (structured outputs).
- **Frontend**: React (Vite), TypeScript, Tailwind CSS v4.
- **Infrastructure**: Docker, Nginx.

---

## Future Improvements & Clarifications

The following improvements were identified during development and were not implemented, as they were not part of the original challenge. They would have to be confirmed with the feature requestor:

### 1. Granular Order Line Data
Currently, order lines are captured with a single description. We recommend **separating "Title" and "Long Description"** for line items to improve reporting and historical price analysis.

### 2. Commodity Group Optimization
The current classification relies solely on the commodity group names. To improve AI selection accuracy, we should **gather more detailed definitions and examples** for each group.

### 3. User Authentication
For a production environment, we would have to implement some form of user authentication.

### 4. Sort and Filter Requests
The admin dashboard should provide options to sort and filter the columns for better overview, when the number of requests increases.

### 5. Export Function
The admin dashboard could provide the functionality to export all requests to, e.g., a csv file.
