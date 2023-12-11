import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../api';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { jwtDecode } from 'jwt-decode';

export default function Authentication(props) {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('access_token')) navigate('/profile');
    }, []);

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    async function login() {
        try {
            const response = await axios.post('/api/token/', {
                email: email,
                password: password,
            });
            localStorage.setItem('access_token', response?.data?.access);
            localStorage.setItem('refresh_token', response?.data?.refresh);
            const response2 = await axios.get('/api/get-profile');
            props.setUser(response2.data);
            navigate('/profile');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Grid container justifyContent={'center'} padding={'10px'}>
            <Grid item xs={12} sm={10} md={6} xl={4}>
                <Paper elevation={6}>
                    <Grid container padding={'10px'}>
                        <Grid item xs={12} paddingY={'5px'}>
                            <TextField fullWidth label="email" size={'small'} onChange={(e) => setEmail(e.target.value)} value={email} />
                        </Grid>
                        <Grid item xs={12} paddingY={'5px'}>
                            <TextField
                                fullWidth
                                label="password"
                                size={'small'}
                                onChange={(e) => setPassword(e.target.value)}
                                type={'password'}
                                value={password}
                            />
                        </Grid>
                        <Grid item xs={12} paddingY={'5px'}>
                            <LoadingButton fullWidth loading={loading} onClick={login} variant={'contained'}>
                                login
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
}
