"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  const countRef = useRef(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  function spawntalkme() {
    const img = document.createElement("img");
    img.src = "/logoTalkme.png";
    img.alt = "logo";
    img.className = styles.logo;

    
    const size = 120;
    img.style.width = `${size}px`;

    // position aléatoire
    const x = Math.random() * Math.max(0, window.innerWidth - size);
    const y = Math.random() * Math.max(0, window.innerHeight - size);

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    document.body.appendChild(img);
    imagesRef.current.push(img);

    countRef.current += 1;
  }

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      });
    };
  }, []);

  return (
    <>
      <section className={styles.error404} onClick={spawntalkme}>
        <div className={styles.logos}>
          <img src="/logoTalkme.png" alt="Logo" />
        </div>

        <h1 className={styles.title}>Error 404</h1>
        <p className={styles.text}>
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <Link href="/" className={styles.btn}>
          Retour à l&apos;accueil
        </Link>
      </section>
    </>
  );
}
