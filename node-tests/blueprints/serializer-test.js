var blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
var setupTestHooks = blueprintHelpers.setupTestHooks;
var emberNew = blueprintHelpers.emberNew;
var emberGenerate = blueprintHelpers.emberGenerate;
var emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;
var modifyPackages = blueprintHelpers.modifyPackages;

var chai = require('ember-cli-blueprint-test-helpers/chai');
var expect = chai.expect;

var SilentError = require('silent-error');

describe('Acceptance: generate and destroy serializer blueprints', function() {
  setupTestHooks(this);

  it('serializer', function() {
    var args = ['serializer', 'foo'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('app/serializers/foo.js'))
          .to.contain('import JSONAPISerializer from \'ember-data/serializers/json-api\';')
          .to.contain('export default JSONAPISerializer.extend(');

        expect(_file('tests/unit/serializers/foo-test.js'))
          .to.contain('moduleForModel(\'foo\'');
      }));
  });

  it('serializer extends application serializer if it exists', function() {
    var args = ['serializer', 'foo'];

    return emberNew()
      .then(() => emberGenerate(['serializer', 'application']))
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('app/serializers/foo.js'))
          .to.contain('import ApplicationSerializer from \'./application\';')
          .to.contain('export default ApplicationSerializer.extend({');

        expect(_file('tests/unit/serializers/foo-test.js'))
          .to.contain('moduleForModel(\'foo\'');
      }));
  });

  it('serializer with --base-class', function() {
    var args = ['serializer', 'foo', '--base-class=bar'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('app/serializers/foo.js'))
          .to.contain('import BarSerializer from \'./bar\';')
          .to.contain('export default BarSerializer.extend({');

        expect(_file('tests/unit/serializers/foo-test.js'))
          .to.contain('moduleForModel(\'foo\'');
      }));
  });

  it('serializer throws when --base-class is same as name', function() {
    var args = ['serializer', 'foo', '--base-class=foo'];

    return emberNew()
      .then(() => expect(emberGenerate(args))
        .to.be.rejectedWith(SilentError, /Serializers cannot extend from themself/));
  });

  it('serializer when is named "application"', function() {
    var args = ['serializer', 'application'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('app/serializers/application.js'))
          .to.contain('import JSONAPISerializer from \'ember-data/serializers/json-api\';')
          .to.contain('export default JSONAPISerializer.extend({');

        expect(_file('tests/unit/serializers/application-test.js'))
          .to.contain('moduleForModel(\'application\'');
      }));
  });

  it('serializer-test', function() {
    var args = ['serializer-test', 'foo'];

    return emberNew()
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('tests/unit/serializers/foo-test.js'))
          .to.contain('moduleForModel(\'foo\'');
      }));
  });

  it('serializer-test for mocha', function() {
    var args = ['serializer-test', 'foo'];

    return emberNew()
      .then(() => modifyPackages([
        {name: 'ember-cli-qunit', delete: true},
        {name: 'ember-cli-mocha', dev: true}
      ]))
      .then(() => emberGenerateDestroy(args, _file => {
        expect(_file('tests/unit/serializers/foo-test.js'))
          .to.contain('import { describeModel, it } from \'ember-mocha\';')
          .to.contain('describeModel(\n  \'foo\',')
          .to.contain('Unit | Serializer | foo')
          .to.contain('needs: [\'serializer:foo\']')
          .to.contain('expect(serializedRecord).to.be.ok;');
      }));
  });
});
