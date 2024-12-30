import Welcome from './components/Welcome';  
import Home from './components/Home'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import { useAuth, AuthProvider} from './AuthContext';
import Base from './components/base/Base';
import 'bootstrap/dist/css/bootstrap.min.css'; 


const App: React.FC = () => {
  const {isAuthenticated}=useAuth();// State to store user data


  return (
    <Router>
      <div>
        {/* Routes to handle different pages */}
        <Routes>
          {/* Route for the login/welcome page */}
          <Route path="/" element={<Welcome />} />

          {/* Route for the home page after login */}
          {isAuthenticated && <Route path="/home" element={<Base><Home /></Base>} />}
        </Routes>
      </div>
    </Router>
  );
};

const AppWrapper: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
export default AppWrapper;