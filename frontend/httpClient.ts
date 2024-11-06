/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

export class HttpClient {
  private baseURL!: string;
  private authToken?: string;

  getBaseUrl() {
    return this.baseURL;
  }

  init(baseURL: string) {
    this.baseURL = baseURL;
  }

  // setAuthToken(token: string) {
  //   this.authToken = token;
  // }
  // getAuthToken() {
  //   return this.authToken;
  // }
  // isAuthTokenSet() {
  //   return !!this.authToken;
  // }

  async get(url: string) {
    console.log("🚀 ~ HttpClient ~ get ~ url:", url)
    
    return this.result(
      await fetch(this.resolve(url), {
        headers: this.getHeaders()
      })
    );
  }

  async delete(url: string) {
    return this.result(
      await fetch(this.resolve(url), {
        method: 'DELETE',
        headers: this.getHeaders()
      })
    );
  }
  async post(url: string, body: unknown) {
    return this.result(
      await fetch(this.resolve(url), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      })
    );
  }
  async patch(url: string, body: unknown) {
    return this.result(
      await fetch(this.resolve(url), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      })
    );
  }

  addQueryString(url: string, params: { [key: string]: string }) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `${url}?${queryString}`;
  }
  private getHeaders() {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    if (this.authToken) {
      headers.append('Authorization', `Bearer ${this.authToken}`);
    }
    return headers;
  }
  private resolve(url: string) {
    return url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url.substring(1) : url}`;
  }

  private async result(response: Response) {
    if (response.ok) {
      return response;
    } else {
      let message = await response.text();
      try {
        message = JSON.parse(message).message;
      } catch (e) {
        message = (e as Error).message;
      }
      message = message || response.statusText;
      return Promise.reject({ message, statusCode: response.status });
    }
  }
}
