<script lang="ts">
    import { createForm } from "felte";
    import { validateSchema } from "@felte/validator-yup";
    import * as yup from "yup";
    import type { ClientResponseError } from "pocketbase";
    import { pb } from "./pocketbase";
    import Icon from "@iconify/svelte";

    let clientError: ClientResponseError;
    let isRegistering = false;

    const signInSchema = yup.object({
        username: yup.string().required(),
        password: yup.string().required(),
    });
    const signInForm = createForm({
        validate: validateSchema(signInSchema),
        onSubmit: async (values) => {
            await login(values);
        },
    });
    const signInValid = signInForm.isValid;
    const signInErrors = signInForm.errors;

    const containsSpecialChars = (input) => /[-\?]/.test(input);
    const signUpSchema = yup.object({
        username: yup
            .string()
            .required("")
            .test(
                "Should not contain special characters",
                "Username should not contain characters: -, ?",
                (value) => !containsSpecialChars(value)
            ),
        password: yup
            .string()
            .required()
            .min(8, "Must be atleast 8 characters")
            .max(72, "Must not be greater than 72 characters"),
        passwordConfirm: yup
            .string()
            .required("")
            .oneOf([yup.ref("password"), null], "Passwords must match"),
        firstName: yup
            .string()
            .required()
            .matches(
                /^[A-Za-z]+$/,
                "First name should only contain alphabetic characters"
            ),
        lastName: yup
            .string()
            .required()
            .matches(
                /^[A-Za-z]+$/,
                "Last name should only contain alphabetic characters"
            ),
    });
    const signUpForm = createForm({
        validate: validateSchema(signUpSchema),
        onSubmit: async (values) => {
            await signUp(values);
        },
    });
    const signUpValid = signUpForm.isValid;
    const signUpErrors = signUpForm.errors;

    async function login(values: any) {
        const { username, password } = values;
        try {
            await pb.collection("users").authWithPassword(username, password);
        } catch (err) {
            clientError = err as ClientResponseError;
        }
    }

    async function signUp(values: any) {
        const { username, firstName, lastName, password, passwordConfirm } =
            values;
        try {
            const data = {
                username,
                firstName,
                lastName,
                password,
                passwordConfirm: passwordConfirm,
            };
            const createdUser = await pb.collection("users").create(data);
            await login(values);
        } catch (err) {
            clientError = err as ClientResponseError;
        }
    }
</script>

<div class="flex flex-col items-center h-full justify-center">
    <h1 class="text-white mb-20 text-4xl text-center">Yin Messaging</h1>
    {#if clientError}
        {#if Object.keys(clientError.data.data).length}
            {#each Object.keys(clientError.data.data) as errorKey}
                <div class="flex gap-x-2 text-red-500 mb-4">
                    <Icon
                        icon="material-symbols:error-circle-rounded"
                        class="text-2xl"
                    />
                    <p>{clientError.data.data.errorKey.message}</p>
                </div>
            {/each}
        {:else}
            <div class="flex gap-x-2 text-red-500 mb-4">
                <Icon
                    icon="material-symbols:error-circle-rounded"
                    class="text-2xl"
                />
                <p>{clientError.message}</p>
            </div>
        {/if}
    {/if}
    {#if isRegistering}
        <form
            action="#"
            use:signUpForm.form
            on:submit|preventDefault
            class="flex flex-col text-white gap-4 w-full md:w-2/3 lg:w-1/3"
        >
            <button
                type="button"
                on:click={() => {
                    isRegistering = false;
                }}
                class="w-fit self-start"
            >
                <Icon icon="material-symbols:arrow-back" class="text-2xl" />
            </button>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:user" class="text-2xl" />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            {#if $signUpErrors.username}
                <small class="text-red-500">{$signUpErrors.username}</small>
            {/if}
            <div class="flex w-full gap-4">
                <div
                    class="flex gap-4 border-2 rounded-full px-6 items-center w-1/2"
                >
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div
                    class="flex gap-4 border-2 rounded-full px-6 items-center w-1/2"
                >
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>
            {#if $signUpErrors.firstName || $signUpErrors.lastName}
                <small class="text-red-500"
                    >First and last name should only contain alphabetic
                    characters</small
                >
            {/if}
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:lock" class="text-2xl" />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:repeat-variant" class="text-2xl" />
                <input
                    type="password"
                    name="passwordConfirm"
                    placeholder="Repeat Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            {#if $signUpErrors.passwordConfirm}
                <small class="text-red-500"
                    >{$signUpErrors.passwordConfirm}</small
                >
            {/if}
            <small> Passwords must be 8 - 72 characters long </small>
            <button
                type="submit"
                disabled={!$signUpValid}
                class={!$signUpValid
                    ? "bg-gray-300 py-2 px-4 rounded font-bold w-full text-lg self-center mt-4"
                    : "bg-purple-600 py-2 px-4 rounded font-bold w-full text-lg hover:bg-purple-700 self-center mt-4"}
                >Sign Up</button
            >
        </form>
    {:else}
        <form
            action="#"
            use:signInForm.form
            on:submit|preventDefault
            class="flex flex-col text-white gap-4 w-full md:w-2/3 lg:w-1/3"
        >
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="mdi:user" class="text-2xl" />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div class="flex gap-4 border-2 rounded-full px-4 items-center">
                <Icon icon="material-symbols:lock" class="text-2xl" />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="bg-transparent appearance-none w-full py-2 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button
                type="submit"
                disabled={!$signInValid}
                class={!$signInValid
                    ? "bg-gray-300 py-2 px-4 rounded font-bold w-full text-lg self-center mt-4"
                    : "bg-purple-600 py-2 px-4 rounded font-bold w-full text-lg hover:bg-purple-700 self-center mt-4"}
                >Login</button
            >
            <p class="text-sm text-center">
                Don't have an account with us? <span
                    class="text-purple-400 cursor-pointer"
                    on:click={() => {
                        clientError = null;
                        isRegistering = true;
                    }}
                    on:keydown>Sign up</span
                >
            </p>
        </form>
    {/if}
</div>
