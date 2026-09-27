export default function Avatar({ user, size = 40, className = '' }) {
    const style = { width: size, height: size };

    if (user?.photoURL) {
        return <img src={user.photoURL} alt={user.fullName} className={`rounded-circle avatar ${className}`} style={style} />;
    }

    const initials = (user?.fullName || '?')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <span className={`rounded-circle avatar avatar-initials ${className}`} style={{ ...style, fontSize: size * 0.38 }} aria-hidden="true">
            {initials}
        </span>
    );
}
