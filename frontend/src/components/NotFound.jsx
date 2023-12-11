import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function NotFound() {
    return (
        <Grid container justifyContent={'center'}>
            <Grid item xs={12} md={8}>
                <Typography textAlign={'center'} variant={'h6'}>
                    404
                </Typography>
            </Grid>
        </Grid>
    );
}
