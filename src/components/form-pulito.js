;<form
  data-netlify="true"
  className="contact-form"
  name="contact"
  method="POST"
  action="/thanks"
  netlify-honeypot="bot-field"
>
  <input name="bot-field" />
  <input name="form-name" value="contact-form" type="hidden" />

  <div className="item">
    <TextField
      type="text"
      name="nome"
      placeholder="Nome"
      label="Nome"
      helperText="Nome richiesto"
      aria-label="Nome"
    />
  </div>
  <div className="item">
    <TextField
      type="text"
      name="email"
      as={TextField}
      placeholder="Email"
      label="Email"
      aria-label="Email"
      helperText="Email richiesta"
    />
  </div>
  <div className="item">
    <TextField
      aria-label="Cellulare"
      type="text"
      name="cellulare"
      as={TextField}
      placeholder="Cellulare"
    />
  </div>
  <div className="item">
    <TextField
      type="text"
      name="messaggio"
      multiline
      rows="5"
      className="textarea"
      as={TextField}
      aria-label="Scrivi qui il motivo per cui mi contatti"
      placeholder="Scrivi qui il motivo per cui mi contatti"
    />
  </div>
  <div className="item text-align-right">
    <Button type="submit" variant="contained" color="primary">
      Invia
    </Button>
  </div>
</form>
