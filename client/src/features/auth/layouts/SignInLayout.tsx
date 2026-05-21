import { Link, Outlet, useLocation, useMatches, useNavigate } from "react-router-dom";
import styles from "./SignInLayout.module.css";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { domain } from "../../../constants/EnvironmentAPI";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ISignInError, SignInErrorSchema, ILoginForm, loginFormSchema } from "../../../../../shared/features/auth/models/ILoginSchema";
import { ISignInContext } from "../models/ISignInContext";
import { homePageRoute, logInPageRoute, signUpPageRoute } from "../../../constants/routes";
import { LoginRegisterSuccessUserInfoSchema } from "../../../../../shared/features/auth/models/ILoginSuccessUserInfo";
import { useAuth } from "../contexts/AuthContext";
import { useMediaQuery } from "react-responsive";
import { mediumScreenMaxWidth, thinScreenMaxWidth, wideScreenMINWidth } from "../../../constants/screenDimensions";
import { USER_PROFILE_IMG_FILE_KEY } from "../../../../../shared/features/auth/constants";
import { LoadingCircle } from "../../../components/LoadingCircle";

import loginImg from "../../../assets/github-profile-img.jpg";
import signupImg from "../../../assets/DEFAULT_USER_IMG.png";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { accessTokenLocalStorageKey } from "../../../constants/accessTokenLocalStorageKey";



export function SignInLayout() {
    const matches = useMatches() as Array<{ handle?: ISignInContext }>;

    const title = matches.find(match => match.handle?.title)?.handle?.title || "Sign In";
    const submitUrl = title.toLowerCase();




    const navigate = useNavigate();

    const location = useLocation();
    const stateERRORS = location.state?.error as ISignInError | undefined;

    const defaultErrors = useMemo(() => {
        const result = SignInErrorSchema.safeParse(stateERRORS);
        if (!result.success) return undefined;

        return {
            [result.data.inputType]: {
                type: "server",
                message: result.data.message,
            },
        };
    }, [stateERRORS]);




    useEffect(() => {
        if (stateERRORS) {
            window.history.replaceState({}, document.title);
        }

    }, []);







    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors
    } = useForm<ILoginForm>({
        resolver: zodResolver(loginFormSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        errors: defaultErrors
    });



    const prevPathRef = useRef(location.pathname);

    useMemo(() => {
        if (prevPathRef.current !== location.pathname) {
            clearErrors();
            prevPathRef.current = location.pathname;
        }
    }, [location.pathname, clearErrors]);


    const {
        setAuthLevel
    } = useAuth();


    const [isLoading, setIsLoading] = useState<boolean>(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);


    const onSubmit: SubmitHandler<ILoginForm> = async (data) => {

        const file = data[USER_PROFILE_IMG_FILE_KEY]?.[0];
        const formData = new FormData();

        formData.append("username", data.username);
        formData.append("password", data.password);

        if (file) {
            console.log("Appending file to formData:", file);
            formData.append(USER_PROFILE_IMG_FILE_KEY, file); 
        }

        
        
        abortControllerRef.current = new AbortController();

        const fetchBody: RequestInit = {
            method: "POST",
            signal: abortControllerRef.current.signal,
            credentials: "include",
        }

        if (submitUrl === "login") {
            fetchBody.headers = {
                "Content-Type": "application/json"
            };
            fetchBody.body = JSON.stringify(data);
        }

        if (submitUrl === "register") {
            fetchBody.body = formData;
        }

        try {
            setIsLoading(true);

            const response = await fetch(`${domain}/api/sign-in/${submitUrl}`, fetchBody);

            if (abortControllerRef.current.signal.aborted) {
                console.log("Request was aborted, not processing response!!!");
                return;
            }

            const responseData = await response.json();
            const responseDataResult = LoginRegisterSuccessUserInfoSchema.safeParse(responseData);

            if (responseDataResult.success && response.ok) {

                localStorage.setItem(accessTokenLocalStorageKey, responseDataResult.data.accessToken);
                await setAuthLevel({
                    userType: "user",
                    userId: responseDataResult.data.userId,
                    username: responseDataResult.data.username,
                    userProfileImgUrl: responseDataResult.data.userProfileImgUrl
                });
                console.log("Successful sign in, navigating to home page...");
                console.dir(responseDataResult.data);
                return;
            }


            const errorResult = SignInErrorSchema.safeParse(responseData);
            if (errorResult.success) {
                setError(errorResult.data.inputType, {
                    type: "server",
                    message: errorResult.data.message
                });

            } else {
                setError("root", {
                    type: "server",
                    message: "An unknown error occurred."
                }); //PLEASE DON'T FORGET FOR LATER PROJECTS THAT root CAN HAVE ADDITIONAL PROPERTIES ATTACHED TO IT FOR CUSTOM ERRORS IF YOU HAVE A SERVER ERROR UNRELATED TO THE USER INPUTS LIKE root.serverError

            }

        } catch (error: unknown) {

            if (error instanceof Error) {
                setError("root", {
                    type: "server",
                    message: error.message || "An error occurred while connecting to the server."
                });
                return;
            }

            setError("root", {
                type: "server",
                message: "Failed to connect to the server."
            });

        } finally {
            setIsLoading(false);

        }
    }

    const isThinScreen: boolean = useMediaQuery({ maxWidth: thinScreenMaxWidth });
    const isMediumScreen: boolean = useMediaQuery({ maxWidth: mediumScreenMaxWidth });

    const screenWidthClassName = useMemo<string>(() => {

        return isThinScreen ? styles.thinScreen : isMediumScreen ? styles.mediumScreen : styles.wideScreen;
    }, [isThinScreen, isMediumScreen]);


    const {
        preview,
        handleFileChange,
        file
    } = useImageUpload();

    const fileInput = register(USER_PROFILE_IMG_FILE_KEY);

    return (
        <>

            <div className={styles.outerContainer}>

                <div className={styles.innerContainer}>


                    <form className={`${styles.form} ${screenWidthClassName}`} onSubmit={handleSubmit(onSubmit)}>


                        {
                            isThinScreen && (
                                <h1 className={`${styles.title} ${screenWidthClassName}`}>{title}</h1>
                            )
                        }


                        <div className={`${styles.imgContainer} ${screenWidthClassName}`}>
                            {
                                submitUrl === "login" ?

                                    <div className={styles.loginImgContainer}>
                                        <img
                                            src={`${loginImg}`}
                                            alt="Login Illustration"
                                            className={`${styles.loginImg} ${screenWidthClassName}`}
                                        />
                                    </div>

                                    :

                                    <>

                                        <div className={`${styles.signupImgContainer} ${screenWidthClassName}`}>

                                            <img
                                                src={`${preview ?? signupImg}`}
                                                alt="Sign Up Profile Image"
                                                className={`${styles.signupImg} ${screenWidthClassName}`}
                                            />

                                        </div>

                                        <div className={`${styles.uploadBtnContainer} ${screenWidthClassName}`}>

                                            <label className={`${styles.uploadBtn} ${screenWidthClassName}`}>
                                                +
                                                <input
                                                    hidden
                                                    className={styles.inputProfileImg}
                                                    type="file"
                                                    {...fileInput}
                                                    onChange={(e) => {
                                                        fileInput.onChange(e);
                                                        handleFileChange(e);
                                                    }}
                                                />
                                            </label>

                                        </div>

                                    </>


                            }
                        </div>


                        <div className={`${styles.textInputsContainer} ${screenWidthClassName}`}>
                            {
                                !isThinScreen && (
                                    <h1 className={styles.title}>{title}</h1>
                                )
                            }

                            <div className={`${styles.errorsContainer} ${screenWidthClassName}`}>

                                {
                                    errors.root && (
                                        <p className={styles.errorMessage}>{`Root error: ${errors.root.message}`}</p>
                                    )
                                }

                                {
                                    errors[USER_PROFILE_IMG_FILE_KEY] && (
                                        <p className={styles.errorMessage}>{`File error: ${errors[USER_PROFILE_IMG_FILE_KEY].message}`}</p>
                                    )
                                }
                                {
                                    errors.username && (
                                        <p className={styles.errorMessage}>{`Username error: ${errors.username.message}`}</p>
                                    )
                                }
                                {
                                    errors.password && (
                                        <p className={styles.errorMessage}>{`Password error: ${errors.password.message}`}</p>
                                    )
                                }

                            </div>

                            <div className={`${styles.inputGroupContainer} ${screenWidthClassName}`}>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        {...register("username")}
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Enter your username..."
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        {...register("password")}
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password..."
                                    />
                                </div>

                                <div className={`${styles.submitBtnContainer} ${screenWidthClassName}`}>

                                    {
                                        isLoading ?

                                            <LoadingCircle height="60%" />

                                            :

                                            <button className={styles.submitButton} type="submit">
                                                Submit
                                            </button>
                                    }


                                </div>

                            </div>

                            <div className={`${styles.bottomContainer} ${screenWidthClassName}`}>

                                {
                                    submitUrl === "login" ?

                                        <p className={styles.switchSignInParagraph}>
                                            Don't have an account?
                                            <Link to={signUpPageRoute}>Sign up here</Link>
                                        </p>
                                        :
                                        <p className={styles.switchSignInParagraph}>
                                            Already have an account?
                                            <Link to={logInPageRoute}>Log in here</Link>
                                        </p>

                                }

                            </div>
                        </div>


                    </form>


                </div>

            </div>


            <Outlet />
        </>
    )
}