export function isEmailValid(email) {
    const elements = email?.split('@');
    if (elements?.length < 2) return;

    const provider = elements[1]?.split('.');
    if (provider?.length < 2) return;

    return elements[0]?.length > 0 && provider[0]?.length > 0 && provider[1]?.length > 0;
}

export function isPasswordValid(password, passwordConfirm) {
    if (passwordConfirm === undefined) return password?.length > 0;

    return password?.length > 0 && password === passwordConfirm;
}

export function getTournamentRequestData(tournament) {
    let data = { ...tournament };
    let tmpDate;

    if (typeof tournament.start_date === 'string') {
        tmpDate = new Date(tournament.start_date);
    } else {
        tmpDate = tournament.start_date;
    }
    let offset = tmpDate.getTimezoneOffset();
    tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
    data['start_date'] = tmpDate.toISOString().split('T')[0];

    if (typeof tournament.end_date === 'string') {
        tmpDate = new Date(tournament.end_date);
    } else {
        tmpDate = tournament.end_date;
    }
    tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
    data['end_date'] = tmpDate.toISOString().split('T')[0];

    data['notes'] = tournament['notes'] === '' ? null : tournament['notes'];
    return data;
}

export function getPaymentRequestData(payment) {
    let data = { ...payment };
    let tmpDate;
    if (typeof payment.start === 'string') {
        tmpDate = new Date(payment.start);
    } else {
        tmpDate = payment.start;
    }

    let offset = tmpDate.getTimezoneOffset();
    tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
    data['start'] = tmpDate.toISOString().split('T')[0];

    if (typeof payment.end === 'string') {
        tmpDate = new Date(payment.end);
    } else {
        tmpDate = payment.end;
    }
    tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
    data['end'] = tmpDate.toISOString().split('T')[0];

    if (typeof payment.date === 'string') {
        tmpDate = new Date(payment.date);
    } else {
        tmpDate = payment.date;
    }
    tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
    data['date'] = tmpDate.toISOString().split('T')[0];

    data['player'] = payment?.player?.id;

    return data;
}
