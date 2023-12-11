import React, { useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import img1 from '../assets/personal-data.png';
import img2 from '../assets/chess-competition.jpg';
import img3 from '../assets/book.jpg';
import { useNavigate } from 'react-router-dom';

export default function Profile({ user }) {
    const navigate = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('access_token')) {
            navigate('/login');
        }
    }, []);

    function cardRow(key, value) {
        return (
            <Grid container item xs={12} justifyContent={'space-between'}>
                <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>
                    {key}
                </Typography>
                <Typography variant={'body2'}>{value}</Typography>
            </Grid>
        );
    }
    return (
        <Grid container justifyContent={'center'}>
            <Card sx={{ width: '400px', margin: '20px' }}>
                <CardMedia sx={{ height: 150 }} image={img1} title="green iguana" />
                <CardContent>
                    <Typography gutterBottom variant="h6" align="center">
                        Adatok
                    </Typography>
                    {cardRow('Név', user?.name)}
                    {cardRow('Születési hely', user?.birthplace ?? '-')}
                    {cardRow('Születési idő', user?.birthdate ?? '-')}
                    {cardRow('Lakcím', user?.address ?? '-')}
                    {cardRow('Anyja neve', user?.mother_name ?? '-')}
                    {cardRow('KOMIR azonosító', user?.komir_id ?? '-')}
                    {cardRow('FIDE azonosító', user?.fide_id ?? '-')}
                </CardContent>
            </Card>
            <Card sx={{ width: '400px', margin: '20px' }}>
                <CardMedia sx={{ height: 150 }} image={img2} title="green iguana" />
                <CardContent>
                    <Typography gutterBottom variant="h6" align="center">
                        Versenyzés
                    </Typography>
                    {cardRow('Következő verseny', user?.next_tournament?.name)}
                    {cardRow('Verseny kezdete', user?.next_tournament?.start_date)}
                    {cardRow('Eddigi versenyek ebben az évben', `${user?.tournament_count?.all} (${user?.tournament_count?.team} csapat)`)}
                    {cardRow('Verseny győzelmek ebben az évben', user?.results?.wins)}
                    {cardRow('Érmek ebben az évben', user?.results?.podiums)}
                    {cardRow('Standard Élő', user?.ratings?.standard)}
                    {cardRow('Rapid Élő', user?.ratings?.rapid)}
                    {cardRow('Blitz Élő', user?.ratings?.blitz)}
                </CardContent>
            </Card>
            <Card sx={{ width: '400px', margin: '20px' }}>
                <CardMedia sx={{ height: 150 }} image={img3} title="green iguana" />
                <CardContent>
                    <Typography gutterBottom variant="h6" align="center">
                        Pénzügyek, kölcsönzés
                    </Typography>
                    {cardRow('Tagdíj befizetés rendezve eddig', user?.last_payment)}
                    {/* {cardRow('Kölcsönzés alatt lévő eszközök', '-')} */}
                    <Typography variant={'body2'} sx={{ fontWeight: 'bold' }}>
                        Kölcsönzés alatt lévő eszközök
                    </Typography>
                    <ul style={{ margin: 0 }}>
                        {user?.lending?.map((record, index) => {
                            return (
                                <li key={index}>
                                    <Typography variant={'body2'}>
                                        {record?.item_name} ({record?.count} darab)
                                    </Typography>
                                </li>
                            );
                        })}
                    </ul>
                </CardContent>
            </Card>
        </Grid>
    );
}
