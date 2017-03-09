import gulp from 'gulp';
import eslint from 'gulp-eslint';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import nodemon from 'gulp-nodemon';
import del from 'del';
import mocha from 'gulp-mocha';

const paths = {
  src: 'src',
  dest: 'lib',
};

gulp.task('clean', () => del(`${paths.dest}/*`));

gulp.task('copy', () => (
  gulp.src(`${paths.src}/**/*.json`)
    .pipe(gulp.dest(paths.dest))
));

gulp.task('build', ['clean', 'copy'], () => (
  gulp.src(`${paths.src}/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest))
));

gulp.task('serve', ['build'], () => {
  nodemon({
    script: `${paths.dest}/server.js`,
    tasks: ['lint', 'build'],
    watch: [paths.src],
  });

  // Make sure to quit if we get a SIGINT, if we subject this part,
  // nodemon will keep on running and eventually halt on errors.
  process.once('SIGINT', () => {
    process.exit(0);
  });
});

gulp.task('lint', () => (
  gulp.src(['gulpfile.babel.js', 'src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
));

gulp.task('test', () => (
  gulp.src(['test/**/*.js'])
    .pipe(mocha())
));

gulp.task('watch', ['build', 'lint'], () => {
  gulp.watch(['gulpfile.babel.js', 'src/**/*.js', 'test/**/*.js'], ['build', 'lint']);
});

gulp.task('default', ['build', 'lint']);
