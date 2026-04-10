import { useForm } from "react-hook-form";
import styles from "./InputMessage.module.css";
import { zodResolver } from "@hookform/resolvers/zod";




export function InputMessageComponent() {

    // const {
    //     handleSubmit,
    //     formState: { errors },
    //     register,
    //     setError,
        
    // } = useForm({
    //     resolver: zodResolver()
    // });


    // const onSubmit = async (data) => {

    // }

    return (
        <>

            <div className={styles.outerContainer}>
                {/* <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}> */}

                    <input type="text" placeholder="Type your message..." className={styles.inputField} />

                    <button type="submit" className={styles.sendButton}>Send</button>

                {/* </form> */}
            </div>



        </>
    )
}