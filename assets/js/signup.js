$(function() {
	var $form = $('form.signup');
	var $password = $form.find('input[name="password"]');
	var $password_confirmation = $form.find('input[name="password_confirmation"]');
	var $help = $password_confirmation.next();
	var $group_confirmation = $password_confirmation.closest('.form-group');

	$password.add($password_confirmation).keyup(function () {
		if ($password.val() != $password_confirmation.val()) {
			$help.show();
			$group_confirmation.addClass('has-error');
		} else {
			$help.hide();
			$group_confirmation.removeClass('has-error');
		}
	});

	$password.keyup();

	$form.on('submit', function () {
		if ($password.val() != $password_confirmation.val()) return false;
		return true;
	});
});