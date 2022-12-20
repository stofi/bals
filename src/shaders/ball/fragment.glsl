/**
* THREE.js, fragment shader
            uTime: { value: 0 },
            uAlbedo: { value: albedo },
            uNormal: { value: normal },
            uRoughness: { value: roughness },
            uColor: { value: new THREE.Color(0x00ff00) },
*/

uniform float uTime;
uniform sampler2D uAlbedoMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform vec3 uColor;

uniform float uT_1;
uniform float uT_2;
uniform float uT_3;
uniform float uT_4;

uniform float uT_5;
uniform float uT_6;
uniform float uT_7;
uniform float uT_8;

// varying vec2 vUv;
// varying vec4 vNormal;

float hue2rgb(float f1, float f2, float hue) {
  if(hue < 0.) {
    hue += 1.0;
  } else if(hue > 1.) {
    hue -= 1.0;
  }

  float res;
  if(6. * hue < 1.) {
    res = f1 + (f2 - f1) * 6. * hue;
  } else if(2. * hue < 1.) {
    res = f2;
  } else if(3. * hue < 2.) {
    res = f1 + (f2 - f1) * (2.0 / 3.0 - hue) * 6.;
  } else {
    res = f1;
  }
  return res;
}

vec3 rgb2hsl(vec3 rgb) {
  float maxC = max(rgb.x, max(rgb.y, rgb.z));
  float minC = min(rgb.x, min(rgb.y, rgb.z));

  float l = (maxC + maxC) / 2.0;

  float h = 0.;
  float s = 0.;

  if(maxC != minC) {
    float d = maxC - minC;
    s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);

    if(maxC == rgb.x) {
      h = (rgb.y - rgb.z) / d + (rgb.y < rgb.z ? 6.0 : 0.0);
    } else if(maxC == rgb.y) {
      h = (rgb.z - rgb.x) / d + 2.0;
    } else {
      h = (rgb.x - rgb.y) / d + 4.0;
    }

    h /= 6.0;
  }

  return vec3(h, s, l);

}

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb;
  if(hsl.y == 0.) {
    rgb = vec3(hsl.z, hsl.z, hsl.z);
  } else {
    float f2;
    if(hsl.z < 0.5) {
      f2 = hsl.z * (1.0 + hsl.y);
    } else {
      f2 = hsl.z + hsl.y - hsl.y * hsl.z;
    }

    float f1 = 2.0 * hsl.z - f2;

    float r = hue2rgb(f1, f2, hsl.x + 1.0 / 3.0);
    float g = hue2rgb(f1, f2, hsl.x);
    float b = hue2rgb(f1, f2, hsl.x - 1.0 / 3.0);

    rgb = vec3(r, g, b);
  }
  return rgb;
}

vec2 mapUv(vec2 st, float f) {

  return st;
}

void main() {
  vec2 _sUv = mapUv(vUv, 4.0);
  vec4 _a = texture2D(uAlbedoMap, _sUv);
  vec4 _r = texture2D(uRoughnessMap, _sUv);

  float _rN = smoothstep(uT_5, uT_6, _r.x + .2);
  csm_Roughness = _rN;

  vec3 _hsl = rgb2hsl(_a.rgb);

  // float _h = _hsl.x;
  float _s = _hsl.y;
  float _l = _hsl.z;

  _s = smoothstep(uT_1, uT_2, _s);
  _l = smoothstep(uT_3, uT_4, _l);

  _hsl = rgb2hsl(uColor.rgb);

  float _hueDesired = _hsl.x;

  _hsl = vec3(_hueDesired, _s, _l);

  vec4 _c = vec4(hsl2rgb(_hsl), 1.0);

  csm_DiffuseColor = _c;
  // csm_DiffuseColor = _a;
  // csm_DiffuseColor = vec4(vec3(_rN), 1.0);
}
