document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:3000/api";

    let currentUser = null;

    // =========================
    // SAFE TOKEN GETTER
    // =========================
    function getToken() {
        return localStorage.getItem("token");
    }

    // =========================
    // SET AUTH STATE
    // =========================
    function setAuthState(user) {
        currentUser = user;

        const usernameEl = document.getElementById("username");

        if (user) {
            document.body.classList.add("authenticated");
            document.body.classList.remove("not-authenticated");

            if (usernameEl) {
                usernameEl.innerText = user.firstName;
            }
        } else {
            document.body.classList.remove("authenticated");
            document.body.classList.add("not-authenticated");

            if (usernameEl) {
                usernameEl.innerText = "User";
            }
        }
    }

    // =========================
    // LOGIN
    // =========================
    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value,
                password: document.getElementById("loginPassword").value
            })
        });

        const data = await res.json();

        if (!data.token) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);

        setAuthState(data);

        window.location.hash = "#profile";
    });

    // =========================
    // AUTO LOGIN
    // =========================
    async function autoLogin() {
        const token = getToken();

        if (!token) {
            setAuthState(null);
            return;
        }

        const res = await fetch(`${API_URL}/profile`, {
            headers: {
                Authorization: token
            }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            setAuthState(null);
            return;
        }

        const user = await res.json();
        setAuthState(user);
    }

    // =========================
    // LOAD PROFILE
    // =========================
    async function loadProfile() {
        const token = getToken();

        const res = await fetch(`${API_URL}/profile`, {
            headers: {
                Authorization: token
            }
        });

        if (!res.ok) {
            logout();
            return;
        }

        const user = await res.json();

        document.getElementById("profileName").innerText =
            `${user.firstName} ${user.lastName}`;
        document.getElementById("profileEmail").innerText = user.email;
        document.getElementById("profileRole").innerText = user.role;

        setAuthState(user);
    }

    // =========================
    // LOGOUT
    // =========================
    document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });

    function logout() {
        localStorage.removeItem("token");
        setAuthState(null);
        window.location.hash = "#home";
    }

    // =========================
    // ADMIN TEST (SAFE)
    // =========================
    window.testAdmin = async function () {

        const token = getToken();

        if (!token) {
            alert("No token found. Please login first.");
            return;
        }

        const res = await fetch(`${API_URL}/admin-test`, {
            headers: {
                Authorization: token
            }
        });

        const data = await res.json();
        console.log("ADMIN TEST:", data);
        alert(JSON.stringify(data));
    };

    // =========================
    // ROUTING
    // =========================
    function handleRouting() {
        const hash = window.location.hash || "#home";

        document.querySelectorAll(".page-section")
            .forEach(s => s.classList.add("d-none"));

        const page = hash.replace("#", "");
        document.getElementById(page)?.classList.remove("d-none");

        if (page === "profile") loadProfile();
    }

    window.addEventListener("hashchange", handleRouting);

    // INIT
    autoLogin();
    handleRouting();
});