<template>
  <main class="main">
    <section class="home section" id="home">
      <div data-aos="fade-left" class="home__container container grid">
        <div class="home__content grid">
          <div class="home__social">
            <a href="https://www.instagram.com/invites/contact/?i=1nzdie95dni4q&utm_content=p6o72vi" target="_blank"
              class="home__social-icon">
              <Icon name="uil-instagram" />
            </a>
            <a href="https://github.com/MRINMOY662" target="_blank" class="home__social-icon">
              <Icon name="uil-github-alt" />
            </a>
            <a href="https://twitter.com/mrinmoy91013697" target="_blank" class="home__social-icon">
              <Icon name="uil-twitter-alt" />
            </a>
          </div>

          <div data-aos="fade-right" class="home__img">
            <svg class="home__blob" viewBox="0 0 200 187" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink">
              <mask id="mask0" mask-type="alpha">
                <path d="M190.312 36.4879C206.582 62.1187 201.309 102.826 182.328 134.186C163.346 165.547 
                                130.807 187.559 100.226 186.353C69.6454 185.297 41.0228 161.023 21.7403 129.362C2.45775 
                                97.8511 -7.48481 59.1033 6.67581 34.5279C20.9871 10.1032 59.7028 -0.149132 97.9666 
                                0.00163737C136.23 0.303176 174.193 10.857 190.312 36.4879Z" />
              </mask>
              <g mask="url(#mask0)">
                <path d="M190.312 36.4879C206.582 62.1187 201.309 102.826 182.328 134.186C163.346 
                                165.547 130.807 187.559 100.226 186.353C69.6454 185.297 41.0228 161.023 21.7403 
                                129.362C2.45775 97.8511 -7.48481 59.1033 6.67581 34.5279C20.9871 10.1032 59.7028 
                                -0.149132 97.9666 0.00163737C136.23 0.303176 174.193 10.857 190.312 36.4879Z" />
              </g>
            </svg>
          </div>

          <div class="home__data">
            <h1 class="home_title">Hi!<span class="wave">👋</span>, I'm Mrinmoy</h1>
            <h3 class="home__subtitle">
              and I'm <span class="auto-input"></span>
            </h3>
            <p class="home__description">
              High level experience in web design and development knowledge, producing quality work.
            </p>
            <a href="#contact" class="button button--flex">
              Contact Me <i class="uil uil-message button__icon"></i>
            </a>
          </div>
        </div>

        <div class="home__scroll">
          <a href="#about" class="home__scroll-button button--flex">
            <Icon name="uil-mouse-alt" class="home__scroll-mouse" />
            <span class="home__scroll-name"> Scroll down</span>
            <Icon name="uil-arrow-down" class="home__scroll-arrow" />
          </a>
        </div>
      </div>
    </section>

    <section class="about section" id="about">
      <h2 class="section__title">About Me</h2>
      <span class="section__subtitle"> My Introduction</span>

      <div data-aos="fade-left" class="about__container container grid">
        <NuxtImg
          src="images/about.jpg"
          alt=""
          class="about__img"
        />

        <div class="about__data">
          <p class="about__description">
            Hi I'm Mrinmoy Deka. I'm 15 years old. When I have free time, it's
            great to indulge in some of my favorite hobbies like study Maths & Science and exploring
            different kinds of new technology. <br>

            I'm a full-stack developer. I have learnt HTML, CSS, JS and Python. I am interested in
            working on projects with an open-source focus.
          </p>

          <div class="about_info">
            <div>
              <span class="about__info-title">02+</span>
              <span class="about__info-name">Years <br />
                experience</span>
            </div>
            <div>
              <span class="about__info-title">20+</span>
              <span class="about__info-name">Completed <br />
                project</span>
            </div>
            <div>
              <span class="about__info-title">24/7</span>
              <span class="about__info-name">Online<br />
                support</span>
            </div>
          </div>

          <div class="about__buttons">
            <a download="" href="assets/pdf/mrinmoy-cv.pdf" class="button button--flex">
              Download CV <i class="uil uil-download-alt button__icon"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="skills section" id="skills">
      <h2 class="section__title">Skills</h2>
      <span class="section__subtitle">My technical level</span>
    </section>

    <section class="contact section" id="contact">
      <h2 class="section__title">Contact Me</h2>
      <span class="section__subtitle">Get in touch</span>

      <div data-aos="fade-in" class="contact__container container grid">
        <div>
          <div class="contact__information">
            <i class="uil uil-envelope contact__icon "></i>
            <!--home__social-->
            <div>
              <h3 class="contact__title">Email</h3>
              <span class="contact__subtitle"> cosmosmrinmoy@gmail.com</span>
            </div>
          </div>
          <div class="contact__information">
            <i class="uil uil-github-alt contact__icon"></i>
            <div>
              <h3 class="contact__title">Github</h3>
              <span class="contact__subtitle">https://github.com/MRINMOY662 </span>
            </div>
          </div>
        </div>

        <form action="https://formsubmit.co/3291f4338dc27f344cdc564a1df42f85" method="POST" class="contact__form grid">
          <div class="contact__inputs grid">
            <div class="contact__content">
              <label for="" class="contact__label">Name</label>
              <input name="name" type="text" class="contact__input">
            </div>
            <div class="contact__content">
              <label for="" class="contact__label">Email</label>
              <input name="email" type="email" class="contact__input">
            </div>
          </div>
          <div class="contact__content">
            <label for="" class="contact__label">Project</label>
            <input name="message" type="text" class="contact__input">
          </div>
          <div class="contact__content">
            <label for="" class="contact__label">Message</label>
            <textarea id="" cols="0" rows="7" class="contact__input" name="message"></textarea>
          </div>

          <div>
            <button type="submit" class="button button--flex">
              Send Message
              <i class="uil uil-message button__icon"></i>
            </button>

          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>

</script>
