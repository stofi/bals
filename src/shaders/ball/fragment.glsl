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

varying vec3 vPos;

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

vec3 uvToSphere(vec2 uv) {
  float lon = uv.x * 2.0 * PI - PI; // Longitude, in radians
  float lat = uv.y * PI - PI * 0.5; // Latitude, in radians
  float x = cos(lat) * cos(lon);
  float y = cos(lat) * sin(lon);
  float z = sin(lat);
  return vec3(x, y, z);
}
vec2 sphereToUv(vec3 pos) {
  float lon = atan(pos.y, pos.x); // Longitude, in radians
  float lat = asin(pos.z); // Latitude, in radians
  float u = (lon + PI) / (2.0 * PI); // Range: 0 to 1
  float v = (lat + PI * 0.5) / PI; // Range: 0 to 1
  return vec2(u, v);
}

mat3 R(vec3 n, float c, float s) {
  return mat3(c + n.x * n.x * (1.0 - c), n.x * n.y * (1.0 - c) - n.z * s, n.x * n.z * (1.0 - c) + n.y * s, n.y * n.x * (1.0 - c) + n.z * s, c + n.y * n.y * (1.0 - c), n.y * n.z * (1.0 - c) - n.x * s, n.z * n.x * (1.0 - c) - n.y * s, n.z * n.y * (1.0 - c) + n.x * s, c + n.z * n.z * (1.0 - c));
}

vec3 rotateVector(vec3 v, vec3 axis, float angle) {
  // Normalize the rotation axis
  vec3 n = normalize(axis);

  // Compute sine and cosine of angle
  float s = sin(angle);
  float c = cos(angle);

  mat3 m_ = R(n, c, s);

  // Rotate the vector
  return m_ * v;
}

vec2 rotateSphereUv(vec2 uv, vec3 axis, float angle) {
  // Convert the UV coordinate to a position on the unit sphere
  vec3 v = uvToSphere(uv);

  // Rotate the position around the axis
  v = rotateVector(v, axis, angle);

  // Map the rotated position back to a UV coordinate using equirectangular mapping
  return sphereToUv(v);
}

void main() {
  vec2 _sUv = mapUv(vUv, 4.0);
  float _y = abs(vPos.y);
  _y = smoothstep(0., .1, _y);

  _sUv = rotateSphereUv(_sUv, vec3(1., 0., 0.), .5 * PI);

  _sUv = mix(vUv, _sUv, _y);

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
  // csm_DiffuseColor = vec4(vec3(_sUv, 0.), 1.0);

  // csm_DiffuseColor = vec4(vec3(_y), 1.0);
}
