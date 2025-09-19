"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, TrendingUp, Users } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  interval: string;
  amount: number;
  subscribers: number;
  status: "active" | "paused";
  created: string;
}

interface BalanceData {
  wallet: string;
  balance: string;
}

export default function CashewDashboard() {
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planToken, setPlanToken] = useState("");
  const [planInterval, setPlanInterval] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [planMetadata, setPlanMetadata] = useState("");
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [createPlanLoading, setCreatePlanLoading] = useState(false);
  const [createPlanError, setCreatePlanError] = useState<string | null>(null);

  // Fetch balance data on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        setBalanceError(null);

        const response = await fetch("/api/balance", { cache: "no-cache" });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data: BalanceData = await response.json();
        console.log("balance is this: ", data.balance);
        setCurrentBalance(parseFloat(data.balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalanceError(
          error instanceof Error ? error.message : "Failed to fetch balance"
        );
        // Fallback to mock data on error
        setCurrentBalance(12847.52);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);

  const handleCreatePlan = async () => {
    if (!planName || !planToken || !planInterval || !planAmount) {
      setCreatePlanError("Please fill in all required fields");
      return;
    }

    try {
      setCreatePlanLoading(true);
      setCreatePlanError(null);

      const response = await fetch("/api/createPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: planToken,
          amount: planAmount,
          interval: planInterval,
          metadata: planMetadata || planName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create plan");
      }

      const data = await response.json();

      // Create the new plan object with the API response
      const newPlan: SubscriptionPlan = {
        id: data.planId || Date.now().toString(),
        name: planName,
        interval: planInterval,
        amount: Number.parseFloat(planAmount),
        subscribers: 0,
        status: "active",
        created: new Date().toISOString().split("T")[0],
      };

      setSubscriptionPlans([...subscriptionPlans, newPlan]);

      // Reset form
      setPlanName("");
      setPlanToken("");
      setPlanInterval("");
      setPlanAmount("");
      setPlanMetadata("");
      setIsCreatePlanOpen(false);
    } catch (error) {
      console.error("Error creating plan:", error);
      setCreatePlanError(
        error instanceof Error ? error.message : "Failed to create plan"
      );
    } finally {
      setCreatePlanLoading(false);
    }
  };

  const totalSubscribers = subscriptionPlans.reduce(
    (sum, plan) => sum + plan.subscribers,
    0
  );
  const activePlans = subscriptionPlans.filter(
    (plan) => plan.status === "active"
  ).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Cashew Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your decentralized payment gateway
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="h-8 w-8" />
            <span className="text-2xl font-bold">₿</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Current Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="text-3xl font-bold text-primary">
                  Loading...
                </div>
              ) : balanceError ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">
                    ${currentBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-500 mt-1">
                    Error: {balanceError}
                  </p>
                </div>
              ) : (
                <div className="text-3xl font-bold text-primary">
                  ${currentBalance.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Active Plans
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-card-foreground">
                {activePlans}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {subscriptionPlans.length - activePlans} paused
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-card-foreground">
                {totalSubscribers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all plans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans Table */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-card-foreground">
              Subscription Plans
            </CardTitle>
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-popover-foreground">
                    Create New Subscription Plan
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {createPlanError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <p className="text-sm text-red-500">{createPlanError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="plan-name"
                      className="text-popover-foreground"
                    >
                      Plan Name *
                    </Label>
                    <Input
                      id="plan-name"
                      placeholder="Enter plan name"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plan-token"
                      className="text-popover-foreground"
                    >
                      Token Address *
                    </Label>
                    <Input
                      id="plan-token"
                      placeholder="0x..."
                      value={planToken}
                      onChange={(e) => setPlanToken(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plan-interval"
                      className="text-popover-foreground"
                    >
                      Billing Interval *
                    </Label>
                    <Select
                      value={planInterval}
                      onValueChange={setPlanInterval}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="60">
                          1 Minute (60 seconds)
                        </SelectItem>
                        <SelectItem value="86400">Daily (1 day)</SelectItem>
                        <SelectItem value="604800">Weekly (7 days)</SelectItem>
                        <SelectItem value="2592000">
                          Monthly (30 days)
                        </SelectItem>
                        <SelectItem value="7776000">
                          Quarterly (90 days)
                        </SelectItem>
                        <SelectItem value="31536000">
                          Yearly (365 days)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plan-amount"
                      className="text-popover-foreground"
                    >
                      Amount (in wei) *
                    </Label>
                    <Input
                      id="plan-amount"
                      type="number"
                      placeholder="1000000000000000000"
                      value={planAmount}
                      onChange={(e) => setPlanAmount(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      1 ETH = 1000000000000000000 wei
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plan-metadata"
                      className="text-popover-foreground"
                    >
                      Metadata (Optional)
                    </Label>
                    <Input
                      id="plan-metadata"
                      placeholder="Additional plan information"
                      value={planMetadata}
                      onChange={(e) => setPlanMetadata(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <Button
                    onClick={handleCreatePlan}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={
                      !planName ||
                      !planToken ||
                      !planInterval ||
                      !planAmount ||
                      createPlanLoading
                    }
                  >
                    {createPlanLoading ? "Creating Plan..." : "Create Plan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-card-foreground">
                    Plan Name
                  </TableHead>
                  <TableHead className="text-card-foreground">
                    Interval
                  </TableHead>
                  <TableHead className="text-card-foreground">Amount</TableHead>
                  <TableHead className="text-card-foreground">
                    Subscribers
                  </TableHead>
                  <TableHead className="text-card-foreground">Status</TableHead>
                  <TableHead className="text-card-foreground">
                    Created
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionPlans.map((plan) => (
                  <TableRow key={plan.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      {plan.name}
                    </TableCell>
                    <TableCell className="text-card-foreground capitalize">
                      {plan.interval}
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      ${plan.amount / 1e18}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {plan.subscribers}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          plan.status === "active" ? "default" : "secondary"
                        }
                        className={
                          plan.status === "active"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(plan.created).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
