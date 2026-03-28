import { useState, useActionState, useEffect, Suspense } from "react";
import { authenticate, registerUser } from "@/app/infra/actions/auth.actions";
import { Button } from "@/app/view/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/view/components/ui/card";
import { Input } from "@/app/view/components/ui/input";
import { Label } from "@/app/view/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/view/components/ui/tabs";
import LogoComponent from "@/app/view/components/ui/logo/logo";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteCode(invite);
      setActiveTab("register");
    }
  }, [searchParams]);

  const [loginErrorMessage, loginAction, isLoginPending] = useActionState(
    authenticate,
    undefined,
  );
  const [registerErrorMessage, registerAction, isRegisterPending] =
    useActionState(registerUser, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="mb-8 flex flex-col items-center gap-4">
        <LogoComponent isAnimated={true} w={120} h={120} />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-emerald-500">
            MinhaCasa
          </h1>
          <p className="text-zinc-500">Onde tudo se organiza.</p>
        </div>
      </div>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {activeTab === "login" ? "Welcome back!" : "Create your home"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {activeTab === "login"
              ? "Entre para ver como está tudo na sua casa."
              : "Cadastre sua casa para começar a organizar tudo por aqui."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-black border border-zinc-800">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form action={loginAction} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                {loginErrorMessage && (
                  <p className="text-sm font-medium text-rose-500">
                    {loginErrorMessage}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isLoginPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                >
                  {isLoginPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando na casa...
                    </>
                  ) : (
                    "Entrar em Casa"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form action={registerAction} className="space-y-4 pt-4">
                <input type="hidden" name="inviteCode" value={inviteCode} />
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Como devemos te chamar?</Label>
                  <Input
                    id="reg-name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail da sua nova casa</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Escolha uma senha segura</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="No mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                {inviteCode && (
                  <p className="text-xs text-emerald-500 font-medium">
                    Você está entrando em uma casa via convite!
                  </p>
                )}
                {registerErrorMessage && (
                  <p className="text-sm font-medium text-rose-500">
                    {registerErrorMessage}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isRegisterPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                >
                  {isRegisterPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando sua casa...
                    </>
                  ) : (
                    "Criar Minha Casa"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4">
          <p className="text-center text-xs text-zinc-500">
            Ao entrar ou cadastrar, você concorda que esta é a sua casa e suas
            próprias regras.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WelcomeView() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <WelcomeContent />
    </Suspense>
  );
}
