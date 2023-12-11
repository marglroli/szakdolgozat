import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import Documents from './components/Documents';
import NotFound from './components/NotFound';
import NewsDashboard from './components/NewsDashboard';
import TournamentDashboard from './components/TournamentDashboard';
import Stats from './components/Stats';
import PlayerDashboard from './components/PlayerDashboard';
import ItemDashboard from './components/ItemDashboard';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { axios } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './components/NavBar';
import About from './components/About';
import Profile from './components/Profile';

export default function App() {
    const [user, setUser] = useState({});
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            // setUser(jwtDecode(localStorage.getItem('access_token'))?.user);
            getProfile();
        }
        getPlayers();
    }, []);

    async function getProfile() {
        try {
            const response = await axios.get('/api/get-profile');
            setUser(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function getPlayers() {
        try {
            const response = await axios.get('/api/player');
            setPlayers(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <ToastContainer position={toast.POSITION.TOP_CENTER} />
            <NavBar user={user} setUser={setUser} />
            <Routes>
                <Route path={'*'} element={<NotFound />} />
                <Route path={'/'} element={<AboutUs />} index />
                <Route path={'about'} element={<About />} />
                <Route path={'/login'} element={<Login setUser={setUser} />} />
                <Route path={'documents'} element={<Documents user={user} players={players} />} />
                <Route path={'items'} element={<ItemDashboard user={user} players={players} />} />
                <Route path={'news'} element={<NewsDashboard user={user} />} />
                <Route path={'players'} element={<PlayerDashboard user={user} players={players} getPlayers={getPlayers} />} />
                <Route path={'profile'} element={<Profile user={user} players={players} />} />
                <Route path={'stats'} element={<Stats players={players} />} />
                <Route path={'tournaments'} element={<TournamentDashboard user={user} players={players} />} />
            </Routes>
        </div>
    );
}
