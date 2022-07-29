const MAIL = (name, email) => {
    const style = `style="color:white;"`;
    return `<section ${style}>
      <h1 style="color:white;">Your codershouse account has been permanetly disabled</h1>
      <p style="color:white;">
          Hey ${name || "user"
        } it seems your are trying to login into your account ${email || ""
        }.<br>
          Your account has been permanetly disabled as per your request, we regret for this inconvenience<br>
          <h3 style="color: red;">Have you not requested for disabling your account?</h3>
          <p style="color:white;">In case, you have not requested for disabling your account then register a new complaint as <br>
              <p style="background-color: gray; display: inline; color:white;">Reactivate My Account</p>, then you will know about the further process.
          </p><br>
          <h3 ${style}>Thanks for using Coder's house</h3>
      </p>
    </section>`;
};

module.exports = MAIL;
