import React from 'react';
import { Dialog, Typography, Grid, Button } from '@mui/material';

export default function (props) {
    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>{props.deleteQuestion}</Typography>
                {props.description && (
                    <Grid container justifyContent={'center'}>
                        <Typography variant={'body1'}>{props.description}</Typography>
                    </Grid>
                )}

                <Grid container paddingY={'20px'} justifyContent={'center'}>
                    <Grid item paddingRight={'10px'}>
                        <Button color={'info'} variant={'contained'} onClick={() => props.setOpen(false)}>
                            Mégse
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color={'error'}
                            variant={'contained'}
                            onClick={() => {
                                props.deleteAction();
                                props.setOpen(false);
                            }}
                        >
                            Törlés
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Dialog>
    );
}
