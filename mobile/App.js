import React, { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";

const COLORS = {
  bg: "#f7f9fb",
  card: "#ffffff",
  cardSoft: "#f2f4f6",
  cardMuted: "#eceef0",
  navy: "#0f172a",
  navyDeep: "#131b2e",
  text: "#191c1e",
  muted: "#64748b",
  border: "#c6c6cd",
  green: "#32f65e",
  greenSoft: "#e8ffea",
  error: "#ba1a1a",
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "view-dashboard" },
  { key: "airtime", label: "Services", icon: "cellphone" },
  { key: "transfer", label: "Transact", icon: "cash-multiple" },
  { key: "history", label: "History", icon: "history" },
  { key: "account", label: "Account", icon: "account-circle" },
];

const QUICK_ACTIONS = [
  {
    key: "airtime",
    label: "Buy Airtime",
    icon: "signal-cellular-3",
    background: COLORS.green,
    text: "#07111f",
  },
  {
    key: "transfer",
    label: "Send Money",
    icon: "swap-horizontal",
    background: COLORS.navy,
    text: "#ffffff",
  },
  {
    key: "history",
    label: "Pay Bills",
    icon: "receipt-text-outline",
    background: COLORS.card,
    text: COLORS.navy,
    border: true,
  },
];

const HERO_CARDS = [
  {
    title: "Total Net Worth",
    value: "R 4,829,000",
    helper: "+12.4% this month",
    icon: "wallet-outline",
    background: COLORS.navyDeep,
    valueColor: "#ffffff",
    helperColor: "#cbd5e1",
    titleColor: "#c7cfdd",
  },
  {
    title: "Current Account",
    value: "R 125,430.50",
    helper: "**** 8821",
    icon: "credit-card-outline",
    background: COLORS.card,
    valueColor: COLORS.text,
    helperColor: COLORS.muted,
    titleColor: COLORS.muted,
    border: true,
  },
  {
    title: "Private Savings",
    value: "R 2,450,000",
    helper: "Fixed Deposit",
    icon: "safe-square-outline",
    background: COLORS.card,
    valueColor: COLORS.text,
    helperColor: COLORS.muted,
    titleColor: COLORS.muted,
    border: true,
  },
];

const DASHBOARD_TRANSACTIONS = [
  {
    name: "Woolworths Food",
    time: "Today, 14:20",
    amount: "- R 1,240.50",
    icon: "shopping-outline",
    negative: true,
  },
  {
    name: "City of Cape Town",
    time: "Yesterday, 09:15",
    amount: "- R 3,500.00",
    icon: "flash-outline",
    negative: true,
  },
  {
    name: "Dividend Payment",
    time: "24 May, 2026",
    amount: "+ R 12,800.00",
    icon: "cash-plus",
    negative: false,
  },
];

const HISTORY_TRANSACTIONS = [
  {
    group: "Today, 26 May",
    items: [
      {
        title: "Woolworths Food Court",
        meta: "14:20 • Visa Debit",
        amount: "-R 1,240.50",
        status: "Cleared",
        icon: "shopping-outline",
        negative: true,
      },
      {
        title: "External Transfer: Capitec",
        meta: "09:15 • Instant EFT",
        amount: "+R 5,000.00",
        status: "Cleared",
        icon: "bank-transfer",
        negative: false,
      },
    ],
  },
  {
    group: "Yesterday, 25 May",
    items: [
      {
        title: "Shell Ultra City N1",
        meta: "21:45 • Amex Gold",
        amount: "-R 850.00",
        status: "Pending",
        icon: "fuel",
        negative: true,
        pending: true,
      },
      {
        title: "Netflix South Africa",
        meta: "00:01 • Recurring Card",
        amount: "-R 199.00",
        status: "Cleared",
        icon: "television-play",
        negative: true,
      },
      {
        title: "Monthly Account Fee",
        meta: "23:59 • System Debit",
        amount: "-R 450.00",
        status: "Cleared",
        icon: "bank-outline",
        negative: true,
      },
    ],
  },
];

const NETWORKS = [
  { key: "vodacom", label: "Vodacom", icon: "alpha-v-box-outline" },
  { key: "mtn", label: "MTN", icon: "alpha-m-box-outline" },
  { key: "cellc", label: "Cell C", icon: "alpha-c-box-outline" },
  { key: "telkom", label: "Telkom", icon: "alpha-t-box-outline" },
];

const RECHARGE_AMOUNTS = [10, 20, 50, 100, 250, "Custom"];
const FACE_CHECK_DELAY_MS = 5000;

const ICON_GLYPHS = {
  "view-dashboard": "▣",
  "account-outline": "◔",
  "email-outline": "✉",
  "lock-outline": "🔒",
  "eye-outline": "◑",
  "eye-off-outline": "◐",
  fingerprint: "◌",
  "camera-outline": "◉",
  "arrow-right": "›",
  cellphone: "◫",
  "cash-multiple": "R",
  history: "↺",
  "account-circle": "PF",
  "bell-outline": "!",
  "help-circle-outline": "?",
  plus: "+",
  "wallet-outline": "◔",
  "credit-card-outline": "▭",
  "safe-square-outline": "S",
  "trending-up": "↑",
  "signal-cellular-3": "5G",
  "swap-horizontal": "⇄",
  "receipt-text-outline": "B",
  "shopping-outline": "◌",
  "flash-outline": "⚡",
  "cash-plus": "+R",
  "alpha-v-box-outline": "V",
  "alpha-m-box-outline": "M",
  "alpha-c-box-outline": "C",
  "alpha-t-box-outline": "T",
  magnify: "⌕",
  "check-circle-outline": "✓",
  "check-decagram-outline": "✓",
  "bank-transfer": "⇆",
  fuel: "⛽",
  "television-play": "▶",
  "bank-outline": "⟦⟧",
  "filter-variant": "≡",
  "wallet-outline": "◔",
  "clock-outline": "⏱",
  "radiobox-marked": "◉",
  "account-plus": "+",
  "pencil-outline": "✎",
  "chevron-right": "›",
  "arrow-left": "‹",
  "help-circle-outline": "?",
  "shield-outline": "🛡",
  "account-cog-outline": "⚙",
  "shield-check-outline": "🛡",
  "contacts-outline": "☎",
  "information-outline": "i",
};

const API_URL = Platform.select({
  android: "http://10.0.2.2:4000",
  ios: "http://localhost:4000",
  default: "http://localhost:4000",
});

const DEMO_PASSWORD = "offline-demo";

const initialAuthForm = {
  email: "alice@flashguard.local",
  password: DEMO_PASSWORD,
  fullName: "Alice Ledger",
};

const initialSignupForm = {
  fullName: "",
  email: "",
  phone: "",
};

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "R 0.00";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function normalizeTransactionStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function formatTransactionStatusLabel(status) {
  const normalized = normalizeTransactionStatus(status);
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeTransactionRecord(item) {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    status: normalizeTransactionStatus(item.status),
  };
}

function formatApprovalCode(transaction) {
  const transactionId = Number(transaction?.id || 0);
  const amountSeed = Math.round(Math.abs(Number(transaction?.amount || 0)) * 100);
  const codeSeed = (transactionId * 7919 + amountSeed) % 1000000;
  return String(codeSeed).padStart(6, "0");
}

function MaterialCommunityIcons({
  name,
  size = 18,
  color = COLORS.text,
  style,
}) {
  const glyph = ICON_GLYPHS[name] ?? "•";
  const fontSize = Math.max(
    10,
    Math.round(size * (glyph.length > 1 ? 0.46 : 0.82)),
  );

  return (
    <Text
      style={[
        { color, fontSize, lineHeight: fontSize + 1, fontWeight: "800" },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}

function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [signedIn, setSignedIn] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [pending, setPending] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("50");
  const [selectedNetwork, setSelectedNetwork] = useState("vodacom");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [instantTransfer, setInstantTransfer] = useState(true);
  const [rechargeMode, setRechargeMode] = useState("airtime");
  const [phone, setPhone] = useState("");
  const [sendForm, setSendForm] = useState({ recipientAccountId: "", amount: "1250" });
  const [approvalDrafts, setApprovalDrafts] = useState({});
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [biometricCameraReady, setBiometricCameraReady] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("Look at the camera and smile.");

  const cameraRef = React.useRef(null);

  const pendingCount = pending.length;

  const headers = useMemo(() => {
    const base = { "Content-Type": "application/json" };
    if (authToken) base.Authorization = `Bearer ${authToken}`;
    return base;
  }, [authToken]);

  const fetchJson = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message || "Request failed");
    }
    return body;
  };

  const loadSessionData = async (accountId) => {
    const [balanceData, accountsData, historyData, pendingData, alertsData] = await Promise.all([
      fetchJson(`/accounts/${accountId}/balance`, { headers }),
      fetchJson("/accounts", { headers }),
      fetchJson("/transactions/history", { headers }),
      fetchJson("/transactions/pending", { headers }),
      fetchJson("/alerts", { headers }),
    ]);

    setBalance(balanceData.balance);
    setAccounts(accountsData);
    setHistory(Array.isArray(historyData) ? historyData.map(normalizeTransactionRecord) : []);
    setPending(Array.isArray(pendingData) ? pendingData.map(normalizeTransactionRecord) : []);
    setAlerts(alertsData);

    const nextRecipient = accountsData.find((account) => account.id !== accountId);
    setSendForm((current) => ({
      ...current,
      recipientAccountId: current.recipientAccountId || String(nextRecipient?.id || ""),
    }));
  };

  useEffect(() => {
    if (!signedIn || !user) return;
    void loadSessionData(user.id);
  }, [signedIn, user]);

  useEffect(() => {
    if (!biometricOpen || !cameraPermission?.granted || loading || !biometricCameraReady) return undefined;

    const timer = setTimeout(() => {
      void captureBiometricFace();
    }, FACE_CHECK_DELAY_MS);

    return () => clearTimeout(timer);
  }, [biometricOpen, cameraPermission?.granted, loading, biometricCameraReady]);

  const handleLogin = async (override = {}) => {
    const email = override.email || authForm.email;
    const password = override.password || authForm.password;
    setLoading(true);
    try {
      const body = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          deviceMetadata: { platform: "android-emulator", alias: "10.0.2.2" },
        }),
      });
      setAuthToken(body.token);
      setUser(body.user);
      setSignedIn(true);
      setActiveTab("dashboard");
      Alert.alert("Welcome back", body.user.full_name);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (loading) return;
    setBiometricOpen(true);
    setBiometricCameraReady(false);
    setBiometricStatus("Look straight at the front camera and smile.");

    if (cameraPermission?.granted) return;

    const permission = await requestCameraPermission();
    if (!permission.granted) {
      Alert.alert("Camera access required", "Enable the camera to use face check sign in.");
      setBiometricOpen(false);
    }
  };

  const captureBiometricFace = async () => {
    if (!cameraRef.current || loading) return;

    setBiometricStatus("Checking your smile...");
    try {
      await cameraRef.current.takePictureAsync({
        quality: 0.6,
        skipProcessing: true,
        mirror: true,
      });
      setBiometricStatus("Smile accepted. Signing you in...");
      await handleLogin({
        email: initialAuthForm.email,
        password: DEMO_PASSWORD,
      });
      setBiometricOpen(false);
      setBiometricCameraReady(false);
    } catch (error) {
      setBiometricStatus("Face check failed. Try again.");
      Alert.alert("Camera check failed", error.message);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: signupForm.email,
          fullName: signupForm.fullName,
          phone: signupForm.phone,
          password: DEMO_PASSWORD,
        }),
      });
      Alert.alert("Profile created", "Use the demo password to sign in.");
      setAuthTab("login");
      setAuthForm((current) => ({
        ...current,
        email: signupForm.email || current.email,
        fullName: signupForm.fullName || current.fullName,
        password: DEMO_PASSWORD,
      }));
    } catch (error) {
      Alert.alert("Sign up failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMoney = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await fetchJson("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          senderAccountId: user.id,
          recipientAccountId: Number(sendForm.recipientAccountId),
          amount: Number(sendForm.amount),
        }),
      });
      Alert.alert(
        "Transfer submitted",
        result.status === "pending"
          ? "The transfer is queued for approval."
          : "The transfer was submitted.",
      );
      await loadSessionData(user.id);
      setActiveTab("history");
    } catch (error) {
      Alert.alert("Transfer failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const authorizeTransaction = async (transaction) => {
    if (!transaction || loading) return;
    setLoading(true);
    try {
      const latestTransaction = await fetchJson(`/transactions/${transaction.id}`, {
        headers,
      });

      if (normalizeTransactionStatus(latestTransaction.status) !== "pending") {
        Alert.alert(
          "Authorization unavailable",
          "This transaction is no longer pending and cannot be approved.",
        );
        await loadSessionData(user.id);
        return;
      }

      await fetchJson(`/transactions/transfer/${transaction.id}/authorize`, {
        method: "POST",
      });
      Alert.alert("Authorized", `Transfer #${transaction.id} was approved.`);
      await loadSessionData(user.id);
    } catch (error) {
      Alert.alert("Authorization failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRechargePurchase = () => {
    if (!user) return;

    const selectedValue =
      selectedAmount === "custom" ? Number(customAmount || 0) : Number(selectedAmount || 0);

    if (!Number.isFinite(selectedValue) || selectedValue <= 0) {
      Alert.alert("Invalid amount", "Enter a valid airtime or data amount.");
      return;
    }

    setLoading(true);
    const networkLabel =
      NETWORKS.find((network) => network.key === selectedNetwork)?.label || "Selected network";
    const serviceLabel = rechargeMode === "data" ? "Data bundle" : "Airtime top-up";

    fetchJson("/transactions/service-purchase", {
      method: "POST",
      body: JSON.stringify({
        senderAccountId: user.id,
        serviceType: rechargeMode,
        network: networkLabel,
        phoneNumber: phone,
        amount: selectedValue,
      }),
    })
      .then(async () => {
        Alert.alert(
          "Purchase submitted",
          `${serviceLabel} for ${networkLabel} was recorded and posted to the backend.`,
        );
        await loadSessionData(user.id);
        setHistoryFilter("all");
        setActiveTab("history");
      })
      .catch((error) => {
        Alert.alert("Purchase failed", error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const visibleHistory = useMemo(() => {
    if (historyFilter === "all") return history;
    return history.filter((item) => normalizeTransactionStatus(item.status) === historyFilter);
  }, [history, historyFilter]);

  const totalTransferAmount = useMemo(() => {
    const baseAmount = Number(sendForm.amount || 0);
    const fee = instantTransfer ? 15 : 0;
    return formatCurrency(baseAmount + fee);
  }, [sendForm.amount, instantTransfer]);

  const selectedRechargeAmount = useMemo(() => {
    if (selectedAmount === "custom") {
      return Number(customAmount || 0);
    }
    return Number(selectedAmount || 0);
  }, [customAmount, selectedAmount]);

  const airtimeTotal = useMemo(
    () => (selectedRechargeAmount > 0 ? `R ${selectedRechargeAmount.toFixed(2)}` : "R 0.00"),
    [selectedRechargeAmount],
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "transfer":
        return (
          <TransferScreen
            accounts={accounts}
            user={user}
            balance={balance}
            sendForm={sendForm}
            setSendForm={setSendForm}
            onSubmit={handleSendMoney}
            loading={loading}
            instantTransfer={instantTransfer}
            setInstantTransfer={setInstantTransfer}
            totalTransferAmount={totalTransferAmount}
          />
        );
      case "history":
        return (
          <HistoryScreen
            history={visibleHistory}
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
            onAuthorize={authorizeTransaction}
            loading={loading}
            approvalDrafts={approvalDrafts}
            setApprovalDrafts={setApprovalDrafts}
            getApprovalCode={formatApprovalCode}
          />
        );
      case "airtime":
        return (
          <AirtimeScreen
            selectedAmount={selectedAmount}
            setSelectedAmount={setSelectedAmount}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
            rechargeMode={rechargeMode}
            setRechargeMode={setRechargeMode}
            phone={phone}
            setPhone={setPhone}
            airtimeTotal={airtimeTotal}
            onPurchase={handleRechargePurchase}
          />
        );
      case "account":
        return (
          <AccountScreen
            user={user}
            pendingCount={pendingCount}
            alerts={alerts}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardScreen
            onQuickActionPress={setActiveTab}
            onPendingApprovalsPress={() => {
              setHistoryFilter("pending");
              setActiveTab("history");
            }}
            balance={balance}
            pendingCount={pendingCount}
            user={user}
            history={history}
          />
        );
    }
  };

  if (!signedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.authShell}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authBackdrop} />
          <View style={styles.authOrbOne} />
          <View style={styles.authOrbTwo} />
          <View style={styles.authStage}>
            {authTab === "login" ? (
              <View style={styles.authPage}>
                <View style={styles.authTopBrand}>
                  <Text style={styles.authBrandTitle}>PrimeFin SA</Text>
                  <Text style={styles.authBrandSubtitle}>MONEY, AIRTIME &amp; DATA</Text>
                </View>

                <View style={styles.authIntroBlock}>
                  <Text style={styles.authPageTitle}>Welcome Back</Text>
                  <Text style={styles.authPageCopy}>
                    Enter your credentials to access your account.
                  </Text>
                </View>

                <View style={styles.authFormPage}>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Email / ID Number</Text>
                    <View style={styles.inputIconShell}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={24}
                        color={COLORS.muted}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="e.g. 9001015000081"
                        placeholderTextColor={COLORS.muted}
                        style={[styles.textField, styles.textFieldWithLeftIcon]}
                        value={authForm.email}
                        onChangeText={(value) =>
                          setAuthForm((current) => ({ ...current, email: value }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.fieldBlock}>
                    <View style={styles.passwordLabelRow}>
                      <Text style={styles.fieldLabel}>Password</Text>
                      <Pressable onPress={() => {}}>
                        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                      </Pressable>
                    </View>
                    <View style={styles.inputIconShell}>
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={24}
                        color={COLORS.muted}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        secureTextEntry={!showLoginPassword}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.muted}
                        style={[styles.textField, styles.textFieldWithLeftIcon, styles.textFieldWithRightIcon]}
                        value={authForm.password}
                        onChangeText={(value) =>
                          setAuthForm((current) => ({ ...current, password: value }))
                        }
                      />
                      <Pressable
                        onPress={() => setShowLoginPassword((current) => !current)}
                        style={styles.inputIconRight}
                      >
                        <MaterialCommunityIcons
                          name={showLoginPassword ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color={COLORS.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable style={styles.loginButton} onPress={() => handleLogin()} disabled={loading}>
                    <Text style={styles.loginButtonText}>
                      {loading ? "Authenticating..." : "Sign In"}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={22} color={COLORS.navy} />
                  </Pressable>

                  <View style={styles.authDividerRow}>
                    <View style={styles.authDividerLine} />
                    <Text style={styles.authDividerText}>Secure Access</Text>
                    <View style={styles.authDividerLine} />
                  </View>

                  <Pressable style={styles.biometricButton} onPress={handleBiometricLogin}>
                    <MaterialCommunityIcons name="face-recognition" size={24} color={COLORS.navy} />
                    <Text style={styles.biometricButtonText}>Sign in with Camera Face Check</Text>
                  </Pressable>
                </View>

                <View style={styles.authFooterBlock}>
                  <Text style={styles.authFooterText}>Don't have a private account? </Text>
                  <Pressable onPress={() => setAuthTab("signup")}>
                    <Text style={styles.authFooterLink}>Create an Account</Text>
                  </Pressable>
                </View>

                <View style={styles.authFooterIcons}>
                  <MaterialCommunityIcons name="shield-outline" size={18} color={COLORS.border} />
                  <MaterialCommunityIcons name="check-decagram-outline" size={18} color={COLORS.border} />
                  <MaterialCommunityIcons name="lock-outline" size={18} color={COLORS.border} />
                </View>
              </View>
            ) : (
              <View style={styles.authPage}>
                <View style={styles.signupHeaderRow}>
                  <Pressable onPress={() => setAuthTab("login")} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.navy} />
                  </Pressable>
                  <Text style={styles.authBrandTitle}>PrimeFin SA</Text>
                  <View style={styles.headerSpacer} />
                </View>

                <View style={styles.signupProgressBlock}>
                  <View style={styles.signupProgressTitleRow}>
                    <Text style={styles.authPageTitle}>Personal Details</Text>
                    <Text style={styles.signupStepText}>Step 1 of 3</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                  </View>
                </View>

                <Text style={styles.signupIntroText}>
                  Let's begin your journey toward simple money, airtime, and data
                  management. Please provide your contact information.
                </Text>

                <View style={styles.authFormPage}>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <View style={styles.inputIconShell}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={24}
                        color={COLORS.muted}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        placeholder="e.g. Johnathan Doe"
                        placeholderTextColor={COLORS.muted}
                        style={[styles.textField, styles.textFieldWithLeftIcon]}
                        value={signupForm.fullName}
                        onChangeText={(value) =>
                          setSignupForm((current) => ({ ...current, fullName: value }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <View style={styles.inputIconShell}>
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={24}
                        color={COLORS.muted}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="name@privatewealth.co.za"
                        placeholderTextColor={COLORS.muted}
                        style={[styles.textField, styles.textFieldWithLeftIcon]}
                        value={signupForm.email}
                        onChangeText={(value) =>
                          setSignupForm((current) => ({ ...current, email: value }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Mobile Number</Text>
                    <View style={styles.mobileInputShell}>
                      <View style={styles.mobileCountryCodeWrap}>
                        <Text style={styles.mobileCountryCode}>+27</Text>
                      </View>
                      <TextInput
                        keyboardType="phone-pad"
                        placeholder="82 123 4567"
                        placeholderTextColor={COLORS.muted}
                        style={styles.mobileInput}
                        value={signupForm.phone}
                        onChangeText={(value) =>
                          setSignupForm((current) => ({ ...current, phone: value }))
                        }
                      />
                    </View>
                  </View>

                  <Text style={styles.signupDisclaimer}>
                    Your data is secured with AES-256 encryption, adhering to the
                    highest South African banking standards.
                  </Text>
                </View>

                <View style={styles.signupFooterBlock}>
                  <Pressable style={styles.signupButton} onPress={handleSignup} disabled={loading}>
                    <Text style={styles.signupButtonText}>
                      {loading ? "Creating profile..." : "Next Step"}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={22} color={COLORS.navy} />
                  </Pressable>

                  <View style={styles.authFooterStack}>
                    <Text style={styles.authFooterText}>Already have a PrimeFin account?</Text>
                    <Pressable onPress={() => setAuthTab("login")}>
                      <Text style={styles.authFooterLinkBlock}>Sign In</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <Modal
          visible={biometricOpen}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setBiometricOpen(false);
            setBiometricCameraReady(false);
          }}
        >
          <View style={styles.biometricModalBackdrop}>
            <View style={styles.biometricModalCard}>
              <Text style={styles.biometricModalTitle}>Face Check</Text>
              <Text style={styles.biometricModalCopy}>
                Hold the phone steady, look into the front camera, and smile to unlock the demo account.
              </Text>

              {cameraPermission?.granted ? (
                <View style={styles.cameraFrame}>
                  <CameraView
                    ref={cameraRef}
                    style={styles.cameraPreview}
                    facing="front"
                    mirror
                    active={biometricOpen}
                    onCameraReady={() => setBiometricCameraReady(true)}
                  />
                  <View style={styles.cameraOverlay} pointerEvents="none">
                    <View style={styles.cameraGuideRing} />
                    <Text style={styles.cameraHint}>{biometricStatus}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.cameraPermissionCard}>
                  <Text style={styles.cameraPermissionText}>
                    Camera permission is needed for the quick face check.
                  </Text>
                  <Pressable style={styles.cameraPrimaryButton} onPress={handleBiometricLogin}>
                    <Text style={styles.cameraPrimaryButtonText}>Allow Camera</Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.cameraActions}>
                <Pressable
                  style={[styles.cameraSecondaryButton, !cameraPermission?.granted && styles.smallButtonDisabled]}
                  onPress={() => {
                    setBiometricOpen(false);
                    setBiometricCameraReady(false);
                  }}
                >
                  <Text style={styles.cameraSecondaryButtonText}>Cancel</Text>
                </Pressable>
                  <View style={[styles.cameraPrimaryButton, (!cameraPermission?.granted || loading) && styles.smallButtonDisabled]}>
                    <Text style={styles.cameraPrimaryButtonText}>
                      {loading ? "Checking..." : "Auto sign-in in 2s"}
                    </Text>
                  </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        {renderScreen()}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "dashboard" ? (
          <Pressable
            style={styles.fab}
            onPress={() => setActiveTab("transfer")}
          >
            <MaterialCommunityIcons name="plus" color="#ffffff" size={30} />
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function DashboardScreen({
  onQuickActionPress,
  onPendingApprovalsPress,
  balance,
  pendingCount,
  user,
  history,
}) {
  const heroCards = [
    {
      title: "Total Net Worth",
      value: formatCurrency(balance),
      helper: user?.full_name ? `Welcome, ${user.full_name.split(" ")[0]}` : "+12.4% this month",
      icon: "wallet-outline",
      background: COLORS.navyDeep,
      valueColor: "#ffffff",
      helperColor: "#cbd5e1",
      titleColor: "#c7cfdd",
    },
    {
      title: "Pending Approvals",
      value: String(pendingCount),
      helper: pendingCount > 0 ? "Needs review" : "Nothing waiting",
      icon: "clock-outline",
      background: COLORS.card,
      valueColor: COLORS.text,
      helperColor: COLORS.muted,
      titleColor: COLORS.muted,
      border: true,
      onPress: onPendingApprovalsPress,
    },
    {
      title: "Recent Activity",
      value: String(history.length),
      helper: "Transactions loaded live",
      icon: "history",
      background: COLORS.card,
      valueColor: COLORS.text,
      helperColor: COLORS.muted,
      titleColor: COLORS.muted,
      border: true,
    },
  ];

  const recentTransactions = history.length > 0 ? history.slice(0, 3) : DASHBOARD_TRANSACTIONS;
  const dashboardTransactions = recentTransactions.map((item) => ({
    name: item.name || `Transfer #${item.id}`,
    time: item.time || formatRelativeTime(item.created_at),
    amount:
      item.amount === undefined || item.amount === null
        ? "R 0.00"
        : formatCurrency(item.amount),
    icon: item.icon || (Number(item.amount) < 0 ? "receipt-text-outline" : "cash-plus"),
    negative:
      item.negative !== undefined ? item.negative : Number(item.amount) < 0,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topHeader}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.full_name || "PF").slice(0, 2).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.kicker}>Welcome back,</Text>
            <Text style={styles.screenTitle}>{user?.full_name || "PrimeFin SA"}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <ActionCircle icon="bell-outline" />
          <ActionCircle icon="help-circle-outline" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={308}
        decelerationRate="fast"
      >
        {heroCards.map((card) => (
          <Pressable
            accessibilityRole={card.onPress ? "button" : undefined}
            onPress={card.onPress}
            style={[
              styles.heroCard,
              {
                backgroundColor: card.background,
                borderColor: card.border ? COLORS.border : "transparent",
              },
            ]}
          >
            <Text style={[styles.heroTitle, { color: card.titleColor }]}>
              {card.title}
            </Text>
            <Text style={[styles.heroValue, { color: card.valueColor }]}>
              {card.value}
            </Text>
            <View style={styles.heroFooter}>
              <View style={styles.heroTrend}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={16}
                  color={card.helperColor}
                />
                <Text style={[styles.heroHelper, { color: card.helperColor }]}>
                  {card.helper}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={card.icon}
                size={24}
                color={card.helperColor}
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              style={styles.quickAction}
              onPress={() => onQuickActionPress(action.key)}
            >
              <View
                style={[
                  styles.quickIconBox,
                  {
                    backgroundColor: action.background,
                    borderWidth: action.border ? 1 : 0,
                    borderColor: action.border ? COLORS.border : "transparent",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={28}
                  color={action.text}
                />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending Summary</Text>
          <View style={styles.pillAccent}>
            <Text style={styles.pillAccentText}>May 2026</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.barChart}>
            {[40, 65, 88, 55, 30, 76, 48].map((height, index) => (
              <View key={`${height}-${index}`} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor:
                        index === 2 ? COLORS.green : COLORS.cardMuted,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.summaryStatsRow}>
            <View>
              <Text style={styles.statLabel}>Investments</Text>
              <Text style={styles.statValue}>R 45,000</Text>
            </View>
            <View style={styles.rightAlign}>
              <Text style={styles.statLabel}>Lifestyle</Text>
              <Text style={styles.statValue}>R 12,340</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        <View style={styles.transactionList}>
          {dashboardTransactions.map((tx) => (
            <View key={tx.name} style={styles.transactionCard}>
              <View style={styles.txLeft}>
                <View style={styles.txIconWrap}>
                  <MaterialCommunityIcons
                    name={tx.icon}
                    size={20}
                    color={COLORS.navy}
                  />
                </View>
                <View>
                            <Text style={styles.sectionTitle}>Spending Summary</Text>
                  <Text style={styles.txMeta}>{tx.time}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.negative ? styles.txNegative : styles.txPositive,
                ]}
              >
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function TransferScreen({
  accounts,
  user,
  balance,
  sendForm,
  setSendForm,
  onSubmit,
  loading,
  instantTransfer,
  setInstantTransfer,
  totalTransferAmount,
}) {
  const beneficiaries = (accounts.length > 0
    ? accounts.filter((account) => account.id !== user?.id)
    : [
        { id: 1, full_name: "Elon Musk", email: "elon@space.x" },
        { id: 2, full_name: "Alice Motsepe", email: "alice@example.com" },
      ]);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenHeaderCompact}>
        <View style={styles.screenHeaderRow}>
          <BackButton />
          <Text style={styles.screenTitle}>PrimeFin SA</Text>
        </View>
        <ActionCircle icon="help-circle-outline" />
      </View>

      <View style={styles.stepper}>
        {["Source", "Target", "Details"].map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepBubble,
                index === 0 ? styles.stepActive : styles.stepMuted,
              ]}
            >
              <Text style={styles.stepBubbleText}>{index + 1}</Text>
            </View>
            <Text
              style={[
                styles.stepText,
                index === 0 ? styles.stepTextActive : styles.stepTextMuted,
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader
          title="From Account"
          icon="check-circle-outline"
          iconColor={COLORS.green}
        />
        <View style={styles.accountCardSelected}>
          <View>
            <Text style={styles.accountNameAccent}>
              {user?.full_name || "Primary Account"}
            </Text>
            <Text style={styles.accountMeta}>**** {String(user?.id || 0).padStart(4, "0")}</Text>
          </View>
          <View style={styles.rightAlign}>
            <Text style={styles.accountBalance}>{formatCurrency(balance)}</Text>
            <Text style={styles.accountMeta}>Available</Text>
          </View>
        </View>
        <Pressable style={styles.dashedButton}>
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={20}
            color={COLORS.muted}
          />
          <Text style={styles.dashedButtonText}>Change Source Account</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader title="To Beneficiary" />
        <View style={styles.searchRow}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.muted}
          />
          <TextInput
            placeholder="Search beneficiaries..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
            value={sendForm.recipientSearch || ""}
            onChangeText={(value) =>
              setSendForm((current) => ({ ...current, recipientSearch: value }))
            }
          />
        </View>
        <View style={styles.beneficiaryList}>
          {beneficiaries.map((beneficiary) => {
            const name = beneficiary.full_name || beneficiary.name || "Contact";
            const active = String(beneficiary.id) === String(sendForm.recipientAccountId);
            return (
              <Pressable
                key={beneficiary.id}
                style={[
                  styles.beneficiaryRow,
                  active && styles.beneficiaryRowActive,
                ]}
                onPress={() =>
                  setSendForm((current) => ({
                    ...current,
                    recipientAccountId: String(beneficiary.id),
                  }))
                }
              >
                <View
                  style={[
                    styles.beneficiaryAvatar,
                    active
                      ? styles.beneficiaryAvatarActive
                      : styles.beneficiaryAvatarMuted,
                  ]}
                >
                  <Text style={styles.beneficiaryAvatarText}>
                    {name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.txTitle}>{name}</Text>
                  <Text style={styles.txMeta}>
                    {beneficiary.email || "Personal Account"}
                  </Text>
                </View>
                {active ? (
                  <MaterialCommunityIcons
                    name="radiobox-marked"
                    size={20}
                    color={COLORS.green}
                    style={styles.beneficiaryCheck}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.inlineButton}>
          <MaterialCommunityIcons
            name="account-plus"
            size={18}
            color={COLORS.green}
          />
          <Text style={styles.inlineButtonText}>Add New Beneficiary</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader title="Transfer Details" />
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Amount (ZAR)</Text>
          <View style={styles.amountFieldWrap}>
            <Text style={styles.amountPrefix}>R</Text>
            <TextInput
              value={sendForm.amount}
              onChangeText={(value) =>
                setSendForm((current) => ({ ...current, amount: value }))
              }
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Your Reference</Text>
          <TextInput
            placeholder="e.g. Monthly Rent"
            placeholderTextColor={COLORS.muted}
            style={styles.textField}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Their Reference</Text>
          <TextInput
            placeholder="e.g. Unit 402 April"
            placeholderTextColor={COLORS.muted}
            style={styles.textField}
          />
        </View>
        <View style={styles.toggleRow}>
          <View style={styles.toggleIconWrap}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={COLORS.green}
            />
          </View>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Instant Payment</Text>
            <Text style={styles.toggleText}>
              Funds clear within 60 seconds (Fee: R15.00)
            </Text>
          </View>
          <Switch
            value={instantTransfer}
            onValueChange={setInstantTransfer}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View>
          <Text style={styles.fieldLabel}>Total Amount</Text>
          <Text style={styles.reviewAmount}>{totalTransferAmount}</Text>
        </View>
        <View style={styles.reviewRight}>
          <Text style={styles.fieldLabel}>Fee included</Text>
          <Text style={styles.reviewLink}>View Breakdown</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>
          {loading ? "Submitting..." : "Review Transaction"}
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
      </Pressable>
      <Text style={styles.footerNote}>
        Secure 256-bit encrypted transaction
      </Text>
    </ScrollView>
  );
}

function HistoryScreen({
  history,
  historyFilter,
  setHistoryFilter,
  onAuthorize,
  loading,
  approvalDrafts,
  setApprovalDrafts,
  getApprovalCode,
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenHeaderCompactAlt}>
        <View style={styles.screenHeaderRow}>
          <BackButton />
          <Text style={styles.screenTitle}>History</Text>
        </View>
        <ActionCircle
          icon="magnify"
          backgroundColor={COLORS.green}
          iconColor={COLORS.navy}
        />
      </View>

      <View style={styles.historySummaryCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.fieldLabel}>Total Spending (May)</Text>
            <Text style={styles.dashboardAmount}>
              {formatCurrency(
                history.reduce((total, item) => total + Math.abs(Number(item.amount || 0)), 0),
              )}
            </Text>
          </View>
        </View>
        <View style={styles.historyFilterRow}>
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
          ].map((filter) => {
            const active = historyFilter === filter.key;
            return (
              <Pressable
                key={filter.key}
                style={[
                  styles.historyFilterChip,
                  active && styles.historyFilterChipActive,
                ]}
                onPress={() => setHistoryFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.historyFilterChipText,
                    active && styles.historyFilterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.miniStatCard}>
            <Text style={styles.statLabel}>Inflow</Text>
            <Text style={styles.inflowValue}>+R 12.4k</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.statLabel}>Outflow</Text>
            <Text style={styles.outflowValue}>-R 8.2k</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {history.length > 0 ? (
          history.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconWrap,
                    item.negative ? styles.txIconMuted : styles.txIconPositive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon || "receipt-text-outline"}
                    size={20}
                    color={item.negative ? COLORS.navy : COLORS.green}
                  />
                </View>
                <View>
                  <Text style={styles.txTitle}>{item.title || `Transfer #${item.id}`}</Text>
                  <Text style={styles.txMeta}>{item.meta || formatRelativeTime(item.created_at)}</Text>
                </View>
              </View>
              <View style={styles.rightAlign}>
                <Text
                  style={[
                    styles.txAmount,
                    item.negative ? styles.txNegative : styles.txPositive,
                  ]}
                >
                  {formatCurrency(item.amount)}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    normalizeTransactionStatus(item.status) === "pending"
                      ? styles.statusPending
                      : styles.statusSuccess,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {formatTransactionStatusLabel(item.status)}
                  </Text>
                </View>
                {normalizeTransactionStatus(item.status) === "pending" ? (
                  <View style={styles.pendingApprovalCard}>
                    <Text style={styles.pendingApprovalLabel}>One-time code</Text>
                    <Text style={styles.pendingApprovalCode}>{getApprovalCode(item)}</Text>
                    <TextInput
                      value={approvalDrafts[item.id] || ""}
                      onChangeText={(value) =>
                        setApprovalDrafts((current) => ({ ...current, [item.id]: value }))
                      }
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.pendingApprovalInput}
                    />
                    <Pressable
                      style={[styles.smallButton, loading && styles.smallButtonDisabled]}
                      onPress={async () => {
                        const enteredCode = String(approvalDrafts[item.id] || "").trim();
                        const expectedCode = getApprovalCode(item);
                        if (enteredCode !== expectedCode) {
                          Alert.alert("OTP mismatch", "Enter the 6-digit code shown on the card.");
                          return;
                        }
                        await onAuthorize(item);
                        setApprovalDrafts((current) => ({ ...current, [item.id]: "" }));
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.smallButtonText}>Approve</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.historyEmptyCard}>
            <Text style={styles.txTitle}>No transactions yet</Text>
            <Text style={styles.txMeta}>Pulling activity from the API once you sign in.</Text>
          </View>
        )}
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.sectionTitleLight}>Spending Insight</Text>
        <Text style={styles.insightText}>
          Your "Dining Out" spending is 12% lower than last month. Private
          Wealth clients typically save this surplus in fixed deposits.
        </Text>
        <Pressable style={styles.lightButton}>
          <Text style={styles.lightButtonText}>Optimize Portfolio</Text>
        </Pressable>
        <View style={styles.insightGlow} />
      </View>
    </ScrollView>
  );
}

function AirtimeScreen({
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  selectedNetwork,
  setSelectedNetwork,
  rechargeMode,
  setRechargeMode,
  phone,
  setPhone,
  airtimeTotal,
  onPurchase,
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenHeaderCompactAlt}>
        <View style={styles.screenHeaderRow}>
          <BackButton />
          <Text style={styles.screenTitle}>Airtime & Data</Text>
        </View>
        <ActionCircle icon="help-circle-outline" />
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.fieldLabel}>Available Balance</Text>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={20}
            color={COLORS.green}
          />
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balancePrefix}>R</Text>
          <Text style={styles.balanceValue}>12,450.00</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.stepHeader}>
          <StepBadge number={1} active />
          <Text style={styles.sectionLabel}>Select Network</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.networkRow}
        >
          {NETWORKS.map((network) => {
            const active = network.key === selectedNetwork;
            return (
              <Pressable
                key={network.key}
                style={[styles.networkCard, active && styles.networkCardActive]}
                onPress={() => setSelectedNetwork(network.key)}
              >
                <MaterialCommunityIcons
                  name={network.icon}
                  size={28}
                  color={active ? COLORS.navy : COLORS.muted}
                />
                <Text
                  style={[
                    styles.networkLabel,
                    active && styles.networkLabelActive,
                  ]}
                >
                  {network.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.stepHeader}>
          <StepBadge number={2} />
          <Text style={styles.sectionLabel}>Recipient Details</Text>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.phoneCode}>+27</Text>
            <TextInput
              placeholder="00 000 0000"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
            />
            <MaterialCommunityIcons
              name="contacts-outline"
              size={20}
              color={COLORS.green}
            />
          </View>
          <View style={styles.helperRow}>
            <MaterialCommunityIcons
              name="information-outline"
              size={14}
              color={COLORS.green}
            />
            <Text style={styles.helperText}>
              Sending to: Mom (082 555 1234)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.stepHeader}>
          <StepBadge number={3} />
          <Text style={styles.sectionLabel}>Select Amount</Text>
        </View>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentItem,
              rechargeMode === "airtime" && styles.segmentItemActive,
            ]}
            onPress={() => setRechargeMode("airtime")}
          >
            <Text
              style={[
                styles.segmentText,
                rechargeMode === "airtime" && styles.segmentTextActive,
              ]}
            >
              Airtime
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentItem,
              rechargeMode === "data" && styles.segmentItemActive,
            ]}
            onPress={() => setRechargeMode("data")}
          >
            <Text
              style={[
                styles.segmentText,
                rechargeMode === "data" && styles.segmentTextActive,
              ]}
            >
              Data Bundles
            </Text>
          </Pressable>
        </View>
        <View style={styles.amountGrid}>
          {RECHARGE_AMOUNTS.map((amount) => {
            const custom = amount === "Custom";
            const active = custom ? selectedAmount === "custom" : amount === selectedAmount;
            return (
              <Pressable
                key={String(amount)}
                style={[
                  styles.amountTile,
                  active && styles.amountTileActive,
                  custom && styles.amountTileCustom,
                ]}
                onPress={() => {
                  if (custom) {
                    setSelectedAmount("custom");
                    setCustomAmount((current) => current || "50");
                    return;
                  }
                  setSelectedAmount(amount);
                }}
              >
                {custom ? (
                  <>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color={COLORS.muted}
                    />
                    <Text style={styles.amountTileLabel}>Custom</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.amountTilePrefix}>R</Text>
                    <Text style={styles.amountTileValue}>{amount}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
          {selectedAmount === "custom" ? (
            <View style={styles.customAmountBlock}>
              <Text style={styles.fieldLabel}>Custom Amount</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.phoneCode}>R</Text>
                <TextInput
                  placeholder="50"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                  style={styles.phoneInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                />
              </View>
            </View>
          ) : null}
      </View>

      <View style={styles.purchaseBar}>
        <View>
          <Text style={styles.fieldLabel}>Total Amount</Text>
          <Text style={styles.purchaseAmount}>{airtimeTotal}</Text>
        </View>
          <Pressable style={styles.purchaseButton} onPress={onPurchase}>
          <Text style={styles.purchaseButtonText}>Purchase</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.card}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function AccountScreen({ user, pendingCount, alerts }) {
  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenHeaderCompactAlt}>
        <View style={styles.screenHeaderRow}>
          <BackButton />
          <Text style={styles.screenTitle}>Account</Text>
        </View>
        <ActionCircle icon="account-cog-outline" />
      </View>

      <View style={styles.accountProfileCard}>
        <View style={styles.profileBadgeLarge}>
          <Text style={styles.profileBadgeText}>
            {(user?.full_name || "PF").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.accountProfileName}>{user?.full_name || "PrimeFin SA"}</Text>
        <Text style={styles.accountProfileSub}>
          Private banking profile and settings
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader
          title="Security"
          icon="shield-check-outline"
          iconColor={COLORS.green}
        />
        <SettingRow title="Biometric login" value="Enabled" />
        <SettingRow title="Notifications" value={`${alerts.length} alerts`} />
        <SettingRow title="Pending approvals" value={`${pendingCount} waiting`} />
      </View>
    </ScrollView>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.key;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveTab(item.key)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={active ? COLORS.green : COLORS.muted}
            />
            <Text style={[styles.navText, active && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionCircle({
  icon,
  backgroundColor = COLORS.cardMuted,
  iconColor = COLORS.text,
}) {
  return (
    <View style={[styles.actionCircle, { backgroundColor }]}>
      <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
    </View>
  );
}

function BackButton() {
  return (
    <View style={styles.backButton}>
      <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.text} />
    </View>
  );
}

function SectionHeader({ title, icon, iconColor = COLORS.muted }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      ) : null}
    </View>
  );
}

function StepBadge({ number, active = false }) {
  return (
    <View
      style={[
        styles.stepBadge,
        active ? styles.stepBadgeActive : styles.stepBadgeMuted,
      ]}
    >
      <Text style={styles.stepBadgeText}>{number}</Text>
    </View>
  );
}

function SettingRow({ title, value }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.txTitle}>{title}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  authShell: {
    minHeight: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: COLORS.bg,
    alignItems: "center",
  },
  authStage: {
    width: "100%",
    maxWidth: 480,
    gap: 20,
    zIndex: 1,
  },
  authPage: {
    width: "100%",
    gap: 18,
    paddingBottom: 8,
  },
  authBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: "#eef2f6",
    opacity: 0.95,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  authOrbOne: {
    position: "absolute",
    top: 8,
    right: -44,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "rgba(50, 246, 94, 0.08)",
  },
  authOrbTwo: {
    position: "absolute",
    bottom: 48,
    left: -44,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(19, 27, 46, 0.06)",
  },
  authTopBrand: {
    alignItems: "center",
    paddingTop: 28,
    gap: 4,
  },
  authBrandTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.6,
  },
  authBrandSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.navy,
    letterSpacing: 2.2,
  },
  authIntroBlock: {
    gap: 10,
    marginTop: 26,
  },
  authPageTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.8,
  },
  authPageCopy: {
    fontSize: 18,
    lineHeight: 28,
    color: "#404753",
  },
  authFormPage: {
    gap: 20,
    marginTop: 12,
  },
  inputIconShell: {
    position: "relative",
    justifyContent: "center",
  },
  inputIconLeft: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
  textFieldWithLeftIcon: {
    paddingLeft: 56,
  },
  textFieldWithRightIcon: {
    paddingRight: 56,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
  },
  forgotPasswordLink: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
  },
  inputIconRight: {
    position: "absolute",
    right: 16,
    zIndex: 2,
  },
  loginButton: {
    marginTop: 8,
    minHeight: 88,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  loginButtonText: {
    color: COLORS.navy,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  authDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  authDividerText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  biometricButton: {
    minHeight: 84,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.navy,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  biometricButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  authFooterBlock: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  authFooterStack: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
  },
  authFooterText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  authFooterLink: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    textDecorationLine: "underline",
    textDecorationColor: COLORS.navy,
    textDecorationStyle: "solid",
  },
  authFooterLinkBlock: {
    color: COLORS.navy,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    textDecorationLine: "underline",
    textDecorationColor: COLORS.navy,
  },
  authFooterIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    opacity: 0.45,
    marginTop: 4,
  },
  signupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  headerSpacer: {
    width: 40,
  },
  signupProgressBlock: {
    gap: 10,
    marginTop: 18,
  },
  signupProgressTitleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  signupStepText: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    width: "33%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },
  signupIntroText: {
    color: "#404753",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 10,
  },
  mobileInputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: "hidden",
    minHeight: 72,
  },
  mobileCountryCodeWrap: {
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    minHeight: 72,
    justifyContent: "center",
  },
  mobileCountryCode: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "800",
  },
  mobileInput: {
    flex: 1,
    minHeight: 72,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 18,
  },
  signupDisclaimer: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
    marginTop: 2,
  },
  signupFooterBlock: {
    gap: 18,
    marginTop: 22,
  },
  signupButton: {
    minHeight: 84,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  signupButtonText: {
    color: COLORS.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 128,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  screenHeaderCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  screenHeaderCompactAlt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  screenHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.1)",
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCarousel: {
    paddingVertical: 8,
    gap: 12,
  },
  heroCard: {
    width: 292,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 20,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroHelper: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  viewAll: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
  },
  pillAccent: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillAccentText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "800",
  },
  quickGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  quickIconBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    gap: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  barChart: {
    height: 132,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  summaryStatsRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  dashboardAmount: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  transactionList: {
    gap: 10,
  },
  transactionCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  txIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardMuted,
  },
  txIconMuted: {
    backgroundColor: COLORS.cardMuted,
  },
  txIconPositive: {
    backgroundColor: COLORS.greenSoft,
  },
  txTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  txMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: "800",
  },
  txNegative: {
    color: COLORS.error,
  },
  txPositive: {
    color: "#15803d",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 104,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  navTextActive: {
    color: COLORS.green,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  stepBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepActive: {
    backgroundColor: COLORS.green,
  },
  stepMuted: {
    backgroundColor: COLORS.cardMuted,
  },
  stepBubbleText: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 13,
  },
  stepText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepTextActive: {
    color: COLORS.green,
  },
  stepTextMuted: {
    color: COLORS.muted,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  accountCardSelected: {
    padding: 16,
    backgroundColor: "#f4fff6",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.green,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accountNameAccent: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "800",
  },
  accountMeta: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  accountBalance: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "800",
  },
  dashedButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dashedButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  searchRow: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  beneficiaryList: {
    gap: 10,
    maxHeight: 230,
  },
  beneficiaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  beneficiaryRowActive: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.green,
  },
  beneficiaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  beneficiaryAvatarActive: {
    backgroundColor: COLORS.green,
  },
  beneficiaryAvatarMuted: {
    backgroundColor: COLORS.navyDeep,
  },
  beneficiaryAvatarText: {
    color: COLORS.card,
    fontSize: 13,
    fontWeight: "800",
  },
  beneficiaryCheck: {
    marginLeft: "auto",
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 4,
  },
  inlineButtonText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "800",
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 2,
  },
  amountFieldWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 60,
  },
  amountPrefix: {
    color: COLORS.muted,
    fontSize: 20,
    fontWeight: "800",
  },
  amountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "right",
    paddingVertical: 0,
  },
  textField: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 14,
  },
  toggleRow: {
    borderRadius: 16,
    backgroundColor: COLORS.cardSoft,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eefbf0",
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "800",
  },
  toggleText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  reviewAmount: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  reviewRight: {
    alignItems: "flex-end",
  },
  reviewLink: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  smallButton: {
    marginTop: 6,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonDisabled: {
    opacity: 0.55,
  },
  smallButtonText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  historyEmptyCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    color: COLORS.card,
    fontSize: 15,
    fontWeight: "800",
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  historySummaryCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.green,
  },
  filterButtonText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  historyFilterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  historyFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyFilterChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  historyFilterChipText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  historyFilterChipTextActive: {
    color: COLORS.card,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: COLORS.cardMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inflowValue: {
    color: "#15803d",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  outflowValue: {
    color: COLORS.error,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  historyGroup: {
    gap: 10,
  },
  groupPill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  groupPillText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusSuccess: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  insightCard: {
    backgroundColor: COLORS.navyDeep,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    gap: 12,
  },
  sectionTitleLight: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  insightText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
  },
  lightButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  lightButtonText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  insightGlow: {
    position: "absolute",
    right: -18,
    bottom: -18,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(50, 246, 94, 0.12)",
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  balancePrefix: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: "800",
  },
  balanceValue: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeActive: {
    backgroundColor: COLORS.green,
  },
  stepBadgeMuted: {
    backgroundColor: COLORS.cardMuted,
  },
  stepBadgeText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "900",
  },
  networkRow: {
    gap: 12,
    paddingRight: 8,
  },
  networkCard: {
    width: 92,
    height: 92,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  networkCardActive: {
    borderWidth: 2,
    borderColor: COLORS.green,
    backgroundColor: "#f4fff6",
  },
  networkLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  networkLabelActive: {
    color: COLORS.navy,
  },
  phoneRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  phoneCode: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "800",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 0,
    letterSpacing: 1,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginLeft: 2,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentItemActive: {
    backgroundColor: COLORS.card,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  segmentText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: COLORS.navy,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amountTile: {
    width: "31%",
    minHeight: 90,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  amountTileActive: {
    borderWidth: 2,
    borderColor: COLORS.green,
    backgroundColor: "#f4fff6",
  },
  amountTileCustom: {
    backgroundColor: COLORS.cardSoft,
    borderStyle: "dashed",
  },
  amountTilePrefix: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  amountTileValue: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "800",
  },
  amountTileLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  purchaseBar: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  purchaseAmount: {
    color: COLORS.navy,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  purchaseButton: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  purchaseButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  biometricModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  biometricModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    padding: 20,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  biometricModalTitle: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
  },
  biometricModalCopy: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  cameraFrame: {
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.navyDeep,
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  cameraGuideRing: {
    width: 180,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: COLORS.green,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cameraHint: {
    marginTop: 12,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 8,
  },
  cameraPermissionCard: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 14,
  },
  cameraPermissionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  cameraActions: {
    flexDirection: "row",
    gap: 12,
  },
  cameraPrimaryButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  cameraPrimaryButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  cameraSecondaryButton: {
    flex: 1,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cameraSecondaryButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: "800",
  },
  customAmountBlock: {
    marginTop: 16,
    gap: 8,
  },
  pendingApprovalCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  pendingApprovalLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pendingApprovalCode: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 3,
  },
  pendingApprovalInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  accountProfileCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  profileBadgeLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadgeText: {
    color: COLORS.card,
    fontSize: 22,
    fontWeight: "900",
  },
  accountProfileName: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "800",
  },
  accountProfileSub: {
    color: COLORS.muted,
    fontSize: 13,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardMuted,
  },
  settingValue: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "800",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default App;
