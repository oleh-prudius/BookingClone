import logoUrl from '@shared/assets/triply-vertical.svg'

export function Logo(){
    return (
        <img
            src={logoUrl}
            alt="Triply"
            style={{height:40, filter: 'brightness(0) invert(1)'}}
        />
    )
}