var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.bitbucket.org/2.0/'
});

var pickInputs = {
        'owner': { key: 'owner', validate: { req: true } },
        'repo_slug': { key: 'repo_slug', validate: { req: true } },
        'is_private': { key: 'is_private', type: 'boolean' },
        'name': 'name',
        'description': 'description',
        'scm': { key: 'scm', validate: { enum: ['git', 'hg'] } },
    },
    pickOutputs = {
        'name': 'name',
        'description': 'description',
        'last_updated': 'last_updated',
        'owner': 'owner'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('bitbucket').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors) 
            return this.fail(validateErrors);

        //send API request
        request.post({ 
            uri: 'repositories/' + inputs.owner + '/' + inputs.repo_slug, 
            form: _.omit(inputs, ['owner', 'repo_slug']), 
            oauth: credentials,
            json: true
        }, function (error, responce, body) {
            if (error || (body && body.error))
                this.fail(error || body.error);
            else
                this.complete(util.pickOutputs(body, pickOutputs) || {});

        }.bind(this));
    }
};
