import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
    const navigate = useNavigate();
    if (!location.pathname.includes('about') && localStorage.getItem('access_token')) navigate('/profile');

    return (
        <Grid container justifyContent={'center'}>
            <Grid item lg={6} md={8} xs={12}>
                <Typography variant={'h5'} align="center" sx={{ color: 'rgb(33, 150, 243)' }}>
                    Sakkegyesületi nyilvántartó rendszer fejlesztése
                </Typography>
                <Typography py={1} align="justify">
                    Szakdolgozatommal egy sakkegyesületi nyilvántartó rendszer fejlesztésének folyamatait vizsgálom. A motivációt az adta,
                    hogy a több, mint 10 éves sakkozói pályafutásom során láttam egy-két furcsaságot informatikához némileg értő szemmel. Az
                    e-mail alapú kommunikáció, Exceles és papíros adattárolás ugyan működik, de bőven akadnak buktatói. Nincs továbbá fix
                    kommunikációs felület a külvilág felé. Az üzleti igény részletesebb vizsgálata után megállapítható, hogy a piacon eddig
                    elérhető megoldások nem tudják teljesen kielégíteni a sakk specifikus igényeket. Ez lehetőséget ad arra, hogy valami
                    olyat sikerüljön fejleszteni, ami ténylegesen többet tud nyújtani, mint bármi más meglévő szoftver.
                </Typography>
                <Typography py={1} align="justify">
                    Az általam elképzelt megoldás egy full-stack webalkalmazásban rejlik, amely egyben honlapként is funkcionál, illetve az
                    adott játékosok is kapnak belépési lehetőséget a felületre. Ezáltal mindenki, aki kötődik valamelyest a sakkhoz,
                    valamilyen formában részese lehet a rendszernek. Pozitívuma továbbá az egységesebb adattárolás és előny lehet az is,
                    hogy néhány egyszerű folyamat ezután nem igényel emberi kommunikációt.
                </Typography>
                <Typography py={1} align="justify">
                    Az adatmodell és felhasználói felület tervezési lépések után technológiai megvalósítás React és Django Rest Framework
                    keretrendszerek segítségével történik. Ezek jelenlegi ismereteink alapján egészen korszerűnek számítanak. Lehetőséget
                    adnak arra, hogy mind a fejlesztőnek, mind a felhasználónak egész kényelmes lehessen az élete. A kényelmes megoldásokat,
                    elsősorban a fejlesztő szemszögéből, a munkám során részletesen ecsetelem.
                </Typography>
                <Typography py={1} align="justify">
                    A fejlesztés és tesztelés után összeáll egy átadásra lényegében készen álló szoftver, amely mindenképpen ad egy másabb
                    irányzatot a sakkélethez. Az is megmutatkozik, hogy magában a követelmények mentén fejlesztés is ébreszt gondolatokat a
                    továbbfejlesztéshez, de a valós összkép hatása még többet
                </Typography>
            </Grid>
        </Grid>
    );
}
