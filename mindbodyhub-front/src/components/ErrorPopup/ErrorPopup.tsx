import { IconName, IconVariant } from '@/shared/ui/Icon/types';
import styles from './ErrorPopup.module.scss';
import { Icon } from '@/shared/ui/Icon/Icon';

interface IErrorPopupProps {
    title: string;
    description: string;
    icon: IconName;
    variant?: IconVariant;
    submit?: () => void;
}

function ErrorPopup({ 
    title, 
    description, 
    icon, 
    variant, 
    submit 
}: IErrorPopupProps) {
    
    const handleSubmit = () => {
        if (submit) {
            submit();
        }
    };
    return (
        <div className={styles.errorPopup}>
            <Icon name={icon} variant={variant} className={styles.errorPopup__icon} />
            {/* <h2 className={styles.errorPopup__title}>{title}</h2> */}
            {description && <p className={styles.errorPopup__description}>{description}</p>}
            {submit && <button type="button" className={styles.errorPopup__button} onClick={handleSubmit}>OK</button>}
        </div>
    );
}

export default ErrorPopup;