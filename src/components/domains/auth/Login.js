import React, { useState, useRef } from "react";
import { signIn } from "next-auth/react";

export default function Login({ csrfToken }) {
  const emailRef = useRef();
  let [message, setMessage] = useState();

  const onSubmit = async (e) => {
    e.preventDefault();
    var email = emailRef.current.value;
    if (email) {
      var { error } = await signIn("email", { email, redirect: false });
      if (error) {
        console.log(error);
        setMessage("Something in the emailverse went wrong :/");
      } else {
        setMessage("Success! A link has been emailed to you.");
      }
    }
  };

  return (
    <div className="py-2">
      <form
        className="flex justify-center space-x-2 w-72"
        method="post"
        action="/api/auth/signin/email"
        onSubmit={onSubmit}
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <label>
          <input
            ref={emailRef}
            placeholder="foo@foo.com"
            className={"!w-56"}
            type="email"
            id="email"
            name="email"
          />
        </label>
        <button className="btn" type="submit">
          Sign in with email
        </button>
      </form>
      <div className="my-4 text-center">
        {message && <span className="text-green-500">{message}</span>}
      </div>
    </div>
  );
}
