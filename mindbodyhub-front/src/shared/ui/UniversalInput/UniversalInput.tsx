import styles from "./UniversalInput.module.scss";

interface UniversalInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UniversalInput({ type, placeholder, value, onChange }: UniversalInputProps) {
 
    return (
        <>
            <input 
                className={styles.universalInput} 
                type={type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
            />
        </>
    );
}

export default UniversalInput;