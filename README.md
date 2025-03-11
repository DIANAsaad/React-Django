# Learning Management System (LMS)

A feature-rich Learning Management System (LMS) built using Django and React. This platform provides educators and learners with an interactive environment for managing courses, assignments, and student progress.

## Features

- **User Authentication**: Secure login and registration system for students and instructors.
- **Course Management**: Create, update, and manage courses with modules and lessons.
- **Assignments & Quizzes**: Assign tasks and quizzes to students with automatic grading.
- **Progress Tracking**: Monitor student progress with analytics and reports.
- **Interactive Discussions**: Forums for students and instructors to collaborate.
- **Responsive UI**: User-friendly design accessible on multiple devices.

## Installation

### Backend (Django)

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/lms.git
   cd lms
   ```

2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Apply migrations:
   ```sh
   python manage.py migrate
   ```

5. Create a superuser:
   ```sh
   python manage.py createsuperuser
   ```

6. Run the Django development server:
   ```sh
   python manage.py runserver
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the React development server:
   ```sh
   npm start
   ```

## Usage

- Navigate to `http://127.0.0.1:8000/` for the backend API.
- Open `http://localhost:5173/` in your browser to access the frontend.
- Log in as an instructor to create courses and assignments.
- Students can enroll in courses, complete assignments, and track progress.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch`.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, feel free to reach out!
