// Copyright 2022 Digital Convergence Initiative
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import * as Hapi from '@hapi/hapi';

const plugin = {
  name: 'apiDoc',
  version: '1.0.0',
  register: async function (server: Hapi.Server) {
    server.route({
      method: 'GET',
      path: '/docs',
      handler: function (_request: Hapi.Request, h: Hapi.ResponseToolkit) {
        return h.file('server/static-files/index.html');
      }
    });
    server.route({
      method: 'GET',
      path: '/docs/{file*}',
      handler: function (_request: Hapi.Request, h: Hapi.ResponseToolkit) {
        return h.file('server/static-files/index.html');
      }
    });
    server.route({
      method: 'GET',
      path: '/interface/{file*}',
      handler: function (request: Hapi.Request, h: Hapi.ResponseToolkit) {
        return h.file(`interface/${request.params.file}`);
      }
    });
  }
}


export default plugin
