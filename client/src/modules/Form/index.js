import React, { useState } from "react";
import Input from "../../components/input";
import Button from "../../components/Button";
import { redirect, useNavigate } from "react-router-dom";
const Form = ({ isSignIn = false }) => {
  const [data, setdata] = useState({
    ...(!isSignIn && {
      fullName: "",
    }),
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log("data >> ", data);
    e.preventDefault();

    const res = await fetch(
      `http://localhost:8000/api/${isSignIn ? "login" : "register"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const resData = await res.json();
    if (res.status === 400) {
      console.log("invalid credentials");
    }
    if (res.status === 200) {
      if (resData.token) {
        localStorage.setItem("userToken", resData.token);

        localStorage.setItem("userDetails", JSON.stringify(resData.user));
        navigate("/");
      }
    }
    console.log(res.status);
    console.log(await resData);
    // .then((res) => {
    //   return res.json();
    // })
    // .then((data) => {
    //   console.log(data.token);
    // });

    // if ((await res).status == 400) {
    //   console.log("Invalid Input");
    // } else {
    //   const resData = JSON.stringify(res);
    //   console.log(resData);
    //   if (resData.token) {
    //     localStorage.setItem("user:token", resData.token);
    //     navigate("/");
    //   }
    // }

    // // console.log(resData);
    // if (res) {
    //   navigate("/");
    // }
    // if (res.status == 400) {
    //   alert("Invalid Credentials!");
    // } else {
    //   const resData = res.json();
    //   if (resData.token) {
    //     localStorage.setItem("user:token", resData.token);
    //     localStorage.setItem("user:detail", JSON.stringify(resData.user));
    //     navigate("/");
    //   }
    // }
  };

  // const fetch = async () => {
  //   const res = await fetch(
  //     `localhost:8000/api/${isSignIn ? "login" : "register"}`
  //   );
  //   const data = await res.json();
  //   return data;
  // };

  return (
    <div className="bg-secondary flex items-center justify-center  h-screen">
      <div className="bg-white w-[600px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center ">
        <div className="text-4xl font-extrabold mb-2">
          Welcome {isSignIn && "Back"}
        </div>
        <div className="text-xl font-light mb-14">
          {isSignIn ? "Sign In to START" : " Sign up now to get started"}
        </div>

        <form
          className="flex flex-col items-center w-full"
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          {!isSignIn && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter you name"
              isRequired={true}
              className="w-1/2"
              inputClassName="mb-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              values={data.fullName}
              onChange={(e) => {
                setdata({ ...data, fullName: e.target.value });
              }}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="Enter your Email"
            isRequired={true}
            className=" w-1/2"
            inputClassName="mb-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            values={data.email}
            onChange={(e) => {
              setdata({
                ...data,
                email: e.target.value,
              });
            }}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter you password"
            isRequired={true}
            inputClassName="mb-6 w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            className="w-1/2"
            values={data.password}
            onChange={(e) => {
              setdata({
                ...data,
                password: e.target.value,
              });
            }}
          />

          <Button
            label={isSignIn ? "Sign In" : "Sign Up"}
            className="w-1/2 mt-6 mb-3"
            type="submit"
          />
        </form>

        <div className="mb-8">
          {isSignIn ? "Didn't have an Account?" : " Already have an accound?"}
          <span
            className="underline hover:cursor-pointer text-secondary"
            onClick={() =>
              navigate(`/users/${isSignIn ? "sign_up" : "sign_in"}`)
            }
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form;
