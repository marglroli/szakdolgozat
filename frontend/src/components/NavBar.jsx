import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, cardClasses } from '@mui/material';
export default function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    function logOut() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser({});
        // setLoggedIn(false);
        navigate('/');
    }

    return (
        <Grid container style={{ overflowX: 'auto', borderBottom: '2px solid blue', marginBottom: '20px' }}>
            <Grid container item justifyContent={'space-between'} alignItems={'center'} sx={{ height: '40px', minWidth: '900px' }}>
                <Grid item>
                    <Typography variant={'h5'} sx={{ fontStyle: 'italic', paddingLeft: '20px', top: 10, color: 'rgb(33, 150, 243)' }}>
                        Fantasy Team
                    </Typography>
                </Grid>
                <Grid item>
                    <Grid container justifyContent={'flex-end'} sx={{ flexGrow: 1 }}>
                        {!user?.id && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/')}>
                                <Typography
                                    sx={{
                                        color: location.pathname === '/' ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                                    }}
                                >
                                    Rólunk
                                </Typography>
                            </Grid>
                        )}
                        <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/news')}>
                            <Typography
                                sx={{
                                    color: location.pathname.includes('news') ? 'blue' : 'rgb(33, 150, 243)',
                                    fontWeight: location.pathname.includes('news') ? 'bold' : 'normal',
                                }}
                            >
                                Hírek
                            </Typography>
                        </Grid>
                        {user?.is_staff && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/players')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('players') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('players') ? 'bold' : 'normal',
                                    }}
                                >
                                    Játékosok
                                </Typography>
                            </Grid>
                        )}
                        {user?.is_staff && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/items')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('items') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('items') ? 'bold' : 'normal',
                                    }}
                                >
                                    Eszközök
                                </Typography>
                            </Grid>
                        )}
                        {user?.id && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/tournaments')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('tournaments') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('tournaments') ? 'bold' : 'normal',
                                    }}
                                >
                                    Versenyek
                                </Typography>
                            </Grid>
                        )}
                        {user?.id && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/documents')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('documents') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('documents') ? 'bold' : 'normal',
                                    }}
                                >
                                    Dokumentumok
                                </Typography>
                            </Grid>
                        )}

                        <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/stats')}>
                            <Typography
                                sx={{
                                    color: location.pathname.includes('stats') ? 'blue' : 'rgb(33, 150, 243)',
                                    fontWeight: location.pathname.includes('stats') ? 'bold' : 'normal',
                                }}
                            >
                                Statisztikák
                            </Typography>
                        </Grid>
                        {user?.id && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('profile') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('profile') ? 'bold' : 'normal',
                                    }}
                                >
                                    Profil
                                </Typography>
                            </Grid>
                        )}

                        {!user?.id && (
                            <Grid item sx={{ padding: '5px', height: '100%', cursor: 'pointer' }} onClick={() => navigate('/about')}>
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('about') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('about') ? 'bold' : 'normal',
                                    }}
                                >
                                    Névjegy
                                </Typography>
                            </Grid>
                        )}
                        {!user?.id && (
                            <Grid
                                item
                                sx={{ padding: '5px', height: '100%', cursor: 'pointer', marginLeft: '20px' }}
                                onClick={() => navigate('/login')}
                            >
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('login') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('login') ? 'bold' : 'normal',
                                    }}
                                >
                                    Belépés
                                </Typography>
                            </Grid>
                        )}
                        {user?.id && (
                            <Grid
                                item
                                sx={{ padding: '5px', height: '100%', cursor: 'pointer', marginLeft: '20px' }}
                                onClick={() => logOut()}
                            >
                                <Typography
                                    sx={{
                                        color: location.pathname.includes('logout') ? 'blue' : 'rgb(33, 150, 243)',
                                        fontWeight: location.pathname.includes('logout') ? 'bold' : 'normal',
                                    }}
                                >
                                    Kilépés
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            {/* </Grid>{' '} */}
        </Grid>
    );
}
