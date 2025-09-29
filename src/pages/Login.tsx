import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

export default function Login() {
  const [mobile, setmobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fullmobile = `+91${mobile}`;
    try {
      const res = await api.post("/auth/send-otp", { mobile: fullmobile });

      if (res.data.status === "OK") {
        setIsOtpSent(true);
        toast.success(res.data?.message || "OTP sent successfully");
      } else {
        toast.error(res.data?.message || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fullmobile = `+91${mobile}`;
    try {
      const res = await api.post("/auth/verify-otp", { mobile: fullmobile, otp });

      if (res.data.status === "OK") {
        if (res.data.data.role !== "ADMIN") {
          toast.error("You are not allowed to login.");
          return;
        }
        if (res.data.data.accessToken) {
          localStorage.setItem("authToken", res.data.data.accessToken);
        }
        toast.success(res.data.message || "Login successful");
        setTimeout(() => {
          navigate("/");
        }, 800);
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "You are not allowed to login."
          : "Something went wrong");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">N</span>
              </div>
              <span className="font-bold text-2xl text-primary">namaha</span>
            </div>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mobile">mobile Number</Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="px-3 bg-muted text-muted-foreground select-none">+91</span>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      // Only allow digits, max 10
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setmobile(val);
                    }}
                    className="h-12 flex-1 border-0 focus-visible:ring-0"
                    required
                    placeholder="Enter 10-digit number"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-12"
                  required
                  placeholder="Enter OTP"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {loading ? "Verifying..." : "Verify OTP & Login"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}