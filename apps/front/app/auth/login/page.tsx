'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/app/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();


  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{
    email: string;
    password: string;
  }>({
    email: '',
    password: ''
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  
 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const newErrors = { email: '', password: '' };

  if (!formData.email) {
    newErrors.email = "L'email est requis";

  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email invalide';
  }


  if (!formData.password) {
    newErrors.password = 'Le mot de passe est requis';
  }

  if (Object.values(newErrors).some(Boolean)) {
    setErrors(newErrors);
    return;
  }

  try {
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: '/chat',
        rememberMe: true,
      },
      {
        onSuccess() {
          router.push('/chat');
        },
        onError(ctx) {
          setErrors(prev => ({
            ...prev,
            email: ctx.error.message,
          }));
        },
        fetchOptions: {
          credentials: 'include',
        },

      }
    );

  } catch {
    setErrors(prev => ({

      ...prev,
      email: 'Aieee.. , réessaie plus tard.',
    }));
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(64, 164, 196, 0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          backgroundPosition: '12px 12px',
          animationDuration: '5s',
        }}
      />
      
      
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(79, 182, 215, 0.12) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          backgroundPosition: '24px 36px',
          animationDuration: '4s',
          animationDelay: '0.8s',
        }}
      />
      
      
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(64, 164, 196, 0.18) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundPosition: '48px 24px',
          animationDuration: '6s',
          animationDelay: '1.5s',
        }}
      />
      
      
      <div 
        className="absolute inset-0 opacity-25 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(64, 164, 196, 0.25) 0%, transparent 65%)',
          animationDuration: '7s',
        }}
      />

      <section className="w-full max-w-md px-4 relative z-10">
        <div className="flex flex-col items-center gap-8 rounded-2xl bg-neutral-900/80 backdrop-blur-sm p-8 shadow-2xl border border-neutral-800">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/logoTalkme.png"
              alt="Logo Talkme"
              className="h-20 w-auto"
            />
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Connexion
            </h1>
            <p className="text-xs text-neutral-400">
              Reprends la conversation là où tu l&apos;as laissée.
            </p>
          </div>

          <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <fieldset className="flex w-full flex-col gap-2 border-0">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <input
                className="w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/30"
                type="email"
                name="email"
                id="email"
                placeholder="Entrer l'e-mail"
                aria-describedby="email-error"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span
                  id="email-error"
                  className="text-sm text-[#40a4c4]"
                  aria-live="polite"
                >
                  {errors.email}
                </span>
              )}
            </fieldset>

            <fieldset className="flex w-full flex-col gap-2 border-0">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Mot de passe
              </label>
              <input
                className="w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/30"
                type="password"
                name="password"
                id="password"
                placeholder="Entrer le mot de passe"
                aria-describedby="password-error"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span
                  id="password-error"
                  className="text-sm text-[#40a4c4]"
                  aria-live="polite"
                >
                  {errors.password}
                </span>
              )}
            </fieldset>

            <button
              name="submit"
              className="mt-2 w-full rounded-xl border border-[#2c7fa0] bg-[#40a4c4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4fb6d7] active:scale-95"
              type="submit"
            >
              Se connecter
            </button>

            <div className="mt-2 flex w-full items-center justify-between text-sm">
              <p className="text-xs text-[#c3d6de]">Nouveau sur Talkme ?</p>


              <Link
                href="/auth/register"
                className="font-medium text-[#40a4c4] hover:text-[#4fb6d7]"
              >
                Inscrivez-vous
              </Link>

            </div>
          </form>
        </div>
      </section>
    </div>
  );
}