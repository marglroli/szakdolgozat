import React from 'react';
import { Grid, Typography } from '@mui/material';

export default function AboutUs() {
    return (
        <Grid container>
            <Grid container justifyContent={'center'} py={1}>
                <Typography align={'center'} variant={'h5'} sx={{ color: 'rgb(33, 150, 243)' }}>
                    Lépj velünk kapcsolatba!
                </Typography>
            </Grid>
            <Grid container justifyContent={'center'} py={1}>
                <Typography align={'center'} variant={'body1'}>
                    Edzések: TBD
                </Typography>
            </Grid>
            <Grid container justifyContent={'center'} py={1}>
                <Typography align={'center'} variant={'body1'}>
                    E-mail: TBD
                </Typography>
            </Grid>
            <Grid container justifyContent={'center'} py={1}>
                <Typography align={'center'} variant={'body1'}>
                    Telefonszám: TBD
                </Typography>
            </Grid>
        </Grid>
    );
}
