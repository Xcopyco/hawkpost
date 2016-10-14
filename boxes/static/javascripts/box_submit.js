$(document).ready(function(){
  /*
    Encrypt the current form content
  */
  var encryptContent = function(){
    var serverSigned = $('.server-signed-js').text() === 'True';
    var contentType = serverSigned ? 'Content-Type: text/plain\n\n' : '';

    var options = {
      data: contentType + $("#id_plain").val(),
      // Works for one key, need to change when multiple recipients is available
      publicKeys: openpgp.key.readArmored($(".public-key-js").html()).keys
    };

    openpgp.encrypt(options).then(function(ciphertext) {
      var $box = $("#box");
      $("#id_message").val(ciphertext.data);
      if (quickCheckFormContent()){
        $box.submit();
      } else {
        alert("Well, encryption doesn't seem to be as it should. Try again.");
      }
    });
    return false;
  }

  /*
    Might be useless but
    Check that the content is really encrypted before submitting
  */
  var quickCheckFormContent = function(){
    var begin = "-----BEGIN PGP MESSAGE-----";
    var end = "-----END PGP MESSAGE-----";

    var message = $("#id_message").val();
    var lines = message.split("\n");

    if (lines[0] === begin && lines[lines.length - 2] === end)
      return true;
    return false;
  }

  /*
    Only when javascript is enabled, the form is created.
  */
  var createBox = function(){
    var $formDiv = $(".form-div-js");

    /* Hidden form fields */
    var csrfToken = $formDiv.attr("data-csrf-token");
    var action = $formDiv.attr("data-action");

    var $form = $("<form></form>");
    $form.attr('id', "box").attr("action", action)
    $form.attr("method", "post").addClass("form__wrap link-box__box");

    var $csrfTokenField = $("<input type='hidden' name='csrfmiddlewaretoken'></input>");
    $csrfTokenField.val(csrfToken);
    $form.append($csrfTokenField);

    var $encryptedMessage = $("<input id='id_message' name='message' type='hidden'></input>");
    $form.append($encryptedMessage);

    $formDiv.append($form);

    /* Input fields */
    var $label = $("<label for='id_plain'>Message:</label>");
    var $textArea = $("<textarea id='id_plain' cols='40' rows='10'></textarea>");
    $textArea.attr("placeholder", "All the contents, inserted into this box, will be encripted with " +
                                  "the recipient's public key before leaving this computer.")

    $formDiv.append($("<p class='no-margin-top'></p>").append($label).append($textArea));
    $formDiv.append($("<a id='encrypt-action-js' class='btn-default u-blockify'>Encrypt and Send</a>"));

    $("#encrypt-action-js").on("click", encryptContent);
  }

  /*
    Show introduction tooltip on click
  */
  $(".hawkpost-intro-js").on("click", function(){
    var popup = document.getElementById('hawkpost-intro-popup-js');
    popup.classList.toggle('show');
  })

  createBox();
});
