<template>
  <main class="main">
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
