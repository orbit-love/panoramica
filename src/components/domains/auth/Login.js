import React, { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import Loader from "src/components/domains/ui/Loader";

export default function Login({ csrfToken }) {
  const emailRef = useRef();
  let [message, setMessage] = useState();
  const [loading, setLoading] = useState();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    var email = emailRef.current.value;
    if (email) {
      var { error } = await signIn("email", { email, redirect: false });
      if (error) {
        console.log(error);
        setMessage("Something in the emailverse went wrong :/");
      } else {
        setMessage("Check your inbox, a login link has been emailed to you.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <form
        className="flex flex-col justify-center items-center w-72 md:flex-row md:space-x-2"
        method="post"
        action="/api/auth/signin/email"
        onSubmit={onSubmit}
      >
        <div className="w-full">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <label>
            <input
              ref={emailRef}
              placeholder="foo@foo.com"
              type="email"
              id="email"
              name="email"
            />
          </label>
        </div>
        <button className="btn my-2 md:my-0" type="submit">
          {loading && <Loader />}
          {!loading && "Sign in with email"}
        </button>
      </form>
      {message && (
        <div className="py-2 text-center text-green-600">{message}</div>
      )}
    </div>
  );
}
