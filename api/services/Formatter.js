
module.exports = {

	eventify: function (event, data) {
		return {
			name: event,
			data: data
		};
	},

	/**
	 * Format any messages into a comprehensive json object not yet translated.
	 * @param  {String|Array|Object} errs
	 * @return {Array|Object}
	 */
	errorify: function (errs) {

		// simple string
		if (_.isString(errs)) {
			return { errors: [ this.custom(errs) ] };
		}

		// array of errors
		else if (_.isArray(errs)) {
			var errors = [];
			for (var i in errs) errors.push(this.errorify(errs[i]));
			return { errors : errors };
		}

		// more complex erros
		else if (_.isObject(errs)) {

			// Waterline validation error
			if(errs.ValidationError) {
				return this._validation(errs);
			}

			// unknow format, try to format a custom error
			else {
				return { errors: [ this.custom(errs.template, errs.data) ] };
			}
		}

		// can't do nothing
		return errs;
	},

	/**
	 * Format a custom message based on a template and optional data.
	 * @param  {String} template
	 * @param  {Array} data
	 * @return {Object}
	 */
	custom: function (template, data) {
		return this._format(template, data);
	},

	/**
	 * Format a comprehensive error into a translate string.
	 * @param  {Object} err
	 * @param  {Function} trans
	 * @return {String}
	 */
	stringify: function (err, trans) {
		if (!err['template']) return err['raw'];

		var args = [];

		args.push(err['template']);
		for (var i in err['data']) args.push(trans.call(null, err['data'][i]));

		return trans.apply(null, args);
	},

	/**
	 * Format any messages into a comprehensive json object translated.
	 * @param  {String|Array|Object} errs
	 * @param  {Function} trans
	 * @return {Object}
	 */
	jsonify: function (errs, trans) {
		errs = this.errorify(errs);

		var errors = {};
		for (var i in errs) {
			errors[i] = [];
			for (var j in errs[i]) {
				errors[i].push(this.stringify(errs[i][j], trans));
			}
		}
		return errors;
	},

	/**
	 * Format Waterline validation errors message
	 * @param  {Object} err
	 * @return {Object}
	 */
	_validation: function (err) {
		if (!_.isPlainObject(err) || !err.ValidationError) return err;

		// formated errors
		var errors = {};

		// for each validation errors
		for (var key in err.ValidationError) {

			// formatted errors for the current key
			var error = [];

			for (var i in err.ValidationError[key]) {

				// error template
				var template = '';
				var data = [];

				// gathering ValidationError informations
				var value = err.ValidationError[key][i].data;
				var raw = err.ValidationError[key][i].message;
				var rule = err.ValidationError[key][i].rule;
				var args = err.ValidationError[key][i].args;

				// push the first parameter
				data.push(key);

				// type string
				if (rule == 'string') {
					template = 'The %s should be a string.';
				}

				// type string
				else if (rule == 'email') {
					template = 'The %s should be an email.';
				}

				// type int
				else if (rule == 'integer') {
					template = 'The %s should be an integer.';
				}

				// required
				else if (rule == 'required') {
					template = 'The %s is required.';
				}

				// alphanumeric
				else if (rule == 'alphanumeric') {
					template = 'The %s should be alphanumeric.';
				}

				// minlength
				else if (rule == 'minLength') {
					template = 'The %s should be at least %d characters long.';
					data.push(args[0]);
				}

				// maxlength
				else if (rule == 'maxLength') {
					template = 'The %s should be at most %d characters long.';
					data.push(args[0]);
				}

				else if (rule == 'datetime') {
					template = 'The %s should be a datetime';
				}

				// Unknow error
				else {
					sails.log.warn('Unkown validation rule: ' + rule);
				}

				error.push(this._format(template, data, raw));
			}

			errors[key] = error;
		}

		return errors;
	},

	/**
	 * Format a structured message
	 * @param  {String} template
	 * @param  {Array} data
	 * @param  {String} raw
	 * @return {object}
	 */
	_format: function (template, data, raw) {
		data = data || [];
		raw = raw || 'undefined';

		var message = {};

		message['template'] = template;
		message['data'] = data;
		message['raw'] = raw;

		return message;
	},
}