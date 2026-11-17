(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector("#site-nav");
  var form = document.querySelector("#signup");
  var sourceInput = document.querySelector("#field-source");
  var statusEl = document.querySelector("#form-status");
  var submitBtn = document.querySelector("#submit-btn");
  var canvas = document.querySelector("#breath");

  function readSource() {
    var params = new URLSearchParams(window.location.search);
    var ref = (params.get("ref") || "").trim();
    var utm = (params.get("utm_source") || "").trim();
    var raw = ref || utm;
    return raw.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 120);
  }

  if (sourceInput) sourceInput.value = readSource();

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.textContent = open ? "Close" : "Menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  function clearFieldError(id) {
    var el = document.getElementById(id);
    var err = document.getElementById(id + "-error");
    if (el) el.removeAttribute("aria-invalid");
    if (err) {
      err.hidden = true;
      err.textContent = "";
    }
  }

  function setFieldError(id, message) {
    var el = document.getElementById(id);
    var err = document.getElementById(id + "-error");
    if (el) el.setAttribute("aria-invalid", "true");
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  }

  function clearErrors() {
    ["email", "name", "note"].forEach(clearFieldError);
  }

  function showStatus(kind, message) {
    if (!statusEl) return;
    statusEl.className = "form-status is-" + kind;
    statusEl.textContent = message;
    if (message && statusEl.scrollIntoView) {
      statusEl.scrollIntoView({ block: "nearest" });
    }
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.className = "form-status";
    statusEl.textContent = "";
  }

  function checkedValue(id) {
    var el = document.getElementById(id);
    return el && el.checked ? "yes" : "no";
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
  }

  function endpoint() {
    return String(window.SPIRA_FORM_ENDPOINT || "").trim();
  }

  function useFormEncoding() {
    return window.SPIRA_FORM_FORMAT === "form";
  }

  function mapFields(payload) {
    var map = window.SPIRA_FORM_FIELDS;
    if (!map) return payload;
    var out = {};
    Object.keys(payload).forEach(function (key) {
      if (map[key]) out[map[key]] = payload[key];
    });
    return out;
  }

  function errorMessage(data) {
    if (!data) return "";
    if (data.errors && data.errors[0] && typeof data.errors[0].message === "string") {
      var msg = data.errors[0].message.trim();
      if (msg && msg.length < 180 && msg.indexOf("<") === -1) return msg;
    }
    return "";
  }

  async function readJson(response) {
    var text = "";
    try {
      text = await response.text();
    } catch (err) {
      return null;
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      return null;
    }
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearErrors();
      clearStatus();

      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        showStatus("success", "Thank you. We have your note. Nothing will be installed on your computer.");
        form.reset();
        if (sourceInput) sourceInput.value = readSource();
        return;
      }

      var email = fieldValue("email");
      var name = fieldValue("name");
      var note = fieldValue("note");
      var ok = true;

      if (!validEmail(email)) {
        setFieldError("email", "Enter a real email address.");
        ok = false;
      }
      if (name.length > 120) {
        setFieldError("name", "Keep your name under 120 characters.");
        ok = false;
      }
      if (note.length > 2000) {
        setFieldError("note", "Keep the note under 2000 characters.");
        ok = false;
      }
      if (!ok) {
        var firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
        return;
      }

      var url = endpoint();
      if (!url) {
        showStatus(
          "note",
          "This form is not connected yet, so nothing was sent. Add a form address in assets/config.js. The README explains Formspree and Google Forms."
        );
        return;
      }

      var source = sourceInput ? sourceInput.value : "";
      var payload = {
        source: source,
        email: email,
        name: name,
        run_client: checkedValue("run-client"),
        help_build: checkedValue("help-build"),
        note: note
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        var response;
        if (useFormEncoding()) {
          var body = new URLSearchParams();
          var mapped = mapFields(payload);
          Object.keys(mapped).forEach(function (key) {
            body.set(key, mapped[key]);
          });
await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: body
          });
          showStatus(
            "success",
            "Thank you. You are on the list. Nothing will be installed on your computer."
          );
          form.reset();
          if (sourceInput) sourceInput.value = readSource();
          return;
        }

        var subject = "SPIRA: interest";
        var jsonPayload = Object.assign({}, payload, {
          _subject: source ? subject + " (" + source + ")" : subject
        });
        response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(jsonPayload),
          signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined
        });
        var data = await readJson(response);
        if (!response.ok || (data && data.ok === false)) {
          var detail = errorMessage(data);
          showStatus(
            "error",
            detail
              ? "We could not send that. " + detail + " Your answers are still here."
              : "We could not send that. Your answers are still here. Please try again in a moment."
          );
          return;
        }
        showStatus(
          "success",
          "Thank you. You are on the list. Nothing will be installed on your computer."
        );
        form.reset();
        if (sourceInput) sourceInput.value = readSource();
      } catch (err) {
        showStatus(
          "error",
          "Could not reach the form service. Check your connection and try again. Nothing was sent, and your answers are still here."
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Count me in";
        }
      }
    });
  }

  function setupBreath(target) {
    if (!target) return;
    var ctx = target.getContext("2d");
    if (!ctx) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nodes = [
      { x: 0.5, y: 0.48, period: 7.6, phase: 0, scale: 1.15 },
      { x: 0.26, y: 0.32, period: 6.3, phase: 0.18, scale: 0.62 },
      { x: 0.74, y: 0.3, period: 6.9, phase: 0.46, scale: 0.55 },
      { x: 0.76, y: 0.68, period: 6.0, phase: 0.67, scale: 0.68 },
      { x: 0.3, y: 0.72, period: 6.6, phase: 0.3, scale: 0.58 },
      { x: 0.52, y: 0.2, period: 7.2, phase: 0.82, scale: 0.4 },
      { x: 0.16, y: 0.52, period: 5.7, phase: 0.54, scale: 0.36 },
      { x: 0.6, y: 0.8, period: 6.5, phase: 0.1, scale: 0.42 }
    ];
    var running = true;
    var frameId = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = target.getBoundingClientRect();
      var w = Math.max(1, rect.width);
      var h = Math.max(1, rect.height);
      target.width = Math.round(w * dpr);
      target.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      var w = target.clientWidth;
      var h = target.clientHeight;
      ctx.clearRect(0, 0, w, h);
      var t = (now || 0) / 1000;
      nodes.forEach(function (node) {
        var life = reduce ? 0.42 : (t / node.period + node.phase) % 1;
        var fade = Math.sin(life * Math.PI);
        var radius = (10 + life * 78) * node.scale;
        var x = node.x * w;
        var y = node.y * h;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(186, 216, 198, " + (0.08 + fade * 0.32).toFixed(3) + ")";
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 2.4 * Math.max(node.scale, 0.7), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(236, 245, 239, " + (0.4 + fade * 0.5).toFixed(3) + ")";
        ctx.fill();
      });
    }

    function loop(now) {
      if (!running) return;
      draw(now);
      if (!reduce) frameId = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reduce) draw(0);
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          var visible = entries.some(function (entry) {
            return entry.isIntersecting;
          });
          running = visible && !document.hidden;
          if (running && !reduce) {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(loop);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(target);
    }

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running && !reduce) {
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(loop);
      }
    });

    frameId = window.requestAnimationFrame(loop);
  }

  setupBreath(canvas);
})();
