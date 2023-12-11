import React, { useState, useRef, useEffect } from 'react';
import { Grid, Button, TextField, Paper, Typography, IconButton } from '@mui/material';
import { axios } from '../api';
import DeleteDialog from './DeleteDialog';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewsDashboard({ user }) {
    const [allNews, setAllNews] = useState([]);
    const [news, setNews] = useState({ title: '', content: '', isPublic: true });
    const [mode, setMode] = useState('list');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteQuestion, setDeleteQuestion] = useState('');

    useEffect(() => {
        getNews();
    }, []);

    async function createNews() {
        try {
            const response = await axios.post('/api/news/', { title: news.title, content: news.content, is_public: true });
            if (response?.status === 201) {
                setMode('list');
                toast.success('Sikeres mentés');
                getNews();
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen mentés');
        }
    }

    async function deleteNews() {
        try {
            const response = await axios.delete(`/api/news/${news.id}`, {
                title: news.title,
                content: news.content,
                is_public: true,
            });
            if (response?.status === 204) {
                setMode('list');
                toast.success('Sikeres törlés');
                getNews();
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen törlés');
        }
    }

    async function updateNews() {
        try {
            const response = await axios.patch(`/api/news/${news.id}`, {
                title: news.title,
                content: news.content,
                is_public: true,
            });
            if (response?.status === 200) {
                setMode('list');
                toast.success('Sikeres mentés');
                getNews();
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    async function getNews() {
        try {
            const response = await axios.get('/api/news');
            setAllNews(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    if (mode === 'list') {
        return (
            <Grid container justifyContent={'center'}>
                {user?.is_staff && (
                    <Button
                        onClick={() => {
                            setNews({ title: '', content: '', isPublic: true });
                            setMode('create');
                        }}
                    >
                        Hír hozzáadása
                    </Button>
                )}
                {allNews?.map((_news, index) => (
                    <Grid container item justifyContent={'center'} py={2}>
                        <Grid item md={6} xs={12}>
                            <Paper
                                key={index}
                                onClick={() => {
                                    setMode('retrieve');
                                    setNews(_news);
                                }}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {_news?.title}
                                </Typography>
                                <Typography>{_news?.content?.substring(0, 100)}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (mode === 'create' || mode === 'update') {
        return (
            <Grid container justifyContent={'center'}>
                <Grid container justifyContent={'center'}>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }} align="center">
                        {mode === 'create' ? 'Hír hozzáadása' : 'Hír módosítása'}
                    </Typography>
                </Grid>
                <Grid container item xs={12} md={8} justifyContent={'center'} py={2}>
                    <TextField
                        value={news?.title}
                        fullWidth
                        label="Cím"
                        onChange={(e) => {
                            let copy = { ...news };
                            copy['title'] = e.target.value;
                            setNews(copy);
                        }}
                    />
                </Grid>
                <Grid contianer container justifyContent={'center'} item xs={12} md={8} py={2}>
                    <TextField
                        value={news?.content}
                        fullWidth
                        label="Tartalom"
                        onChange={(e) => {
                            let copy = { ...news };
                            copy['content'] = e.target.value;
                            setNews(copy);
                        }}
                        multiline
                        rows={5}
                    />
                </Grid>
                <Grid contianer container justifyContent={'space-between'} item xs={12} md={8} py={1}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setMode('list');
                                setNews({ title: '', content: '', isPublic: true });
                            }}
                        >
                            Mégse
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                mode === 'create' ? createNews() : updateNews();
                            }}
                        >
                            Mentés
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
    if (mode === 'retrieve') {
        return (
            <Grid container justifyContent={'center'}>
                <DeleteDialog
                    open={deleteDialogOpen}
                    setOpen={setDeleteDialogOpen}
                    deleteQuestion={deleteQuestion}
                    deleteAction={() => deleteNews(news?.id)}
                />
                <Grid container justifyContent={'center'} py={1} alignItems={'center'}>
                    <Grid item>
                        <IconButton
                            onClick={() => {
                                setMode('list');
                            }}
                        >
                            {<ArrowBackIcon />}
                        </IconButton>
                    </Grid>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {news?.title}
                    </Typography>
                    {user?.is_staff && (
                        <Grid item>
                            <IconButton
                                onClick={() => {
                                    setMode('update');
                                }}
                            >
                                {<EditIcon />}
                            </IconButton>
                        </Grid>
                    )}
                    {user?.is_staff && (
                        <Grid item>
                            <IconButton
                                onClick={() => {
                                    setDeleteDialogOpen(true);
                                    setDeleteQuestion('Biztos, hogy törölni szeretné ezt a hírt?');
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    )}
                </Grid>
                <Grid container justifyContent={'center'}>
                    <Grid item xs={12} md={8} xl={6}>
                        <Typography align="justify">{news?.content}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
